"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { INVOICE_STATUSES } from "@/lib/invoice-statuses";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listInvoices(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.invoice.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: {
      deal: {
        select: {
          id: true,
          title: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      lineItems: { select: { quantity: true, unitPrice: true } },
    },
    orderBy: { number: "desc" },
  });
}

export async function getInvoice(orgSlug: string, invoiceId: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return null;

  return prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
    include: {
      deal: {
        select: {
          id: true,
          title: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
      },
      lineItems: { orderBy: { position: "asc" } },
    },
  });
}

// Called directly from a <form action> on the Deal card — no useActionState,
// since success is a redirect rather than a state update.
export async function createInvoiceForDeal(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const dealId = String(formData.get("dealId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: organization.id, deletedAt: null },
  });
  if (!deal) {
    throw new Error("Invalid deal");
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: organization.id },
      data: { invoiceCounter: { increment: 1 } },
    });
    return tx.invoice.create({
      data: {
        organizationId: organization.id,
        dealId: deal.id,
        number: org.invoiceCounter,
        vatRate: organization.invoiceVatRate,
      },
    });
  });

  revalidatePath(`/app/${orgSlug}/deals`);
  redirect(`/app/${orgSlug}/invoices/${invoice.id}`);
}

export type InvoiceFormState = { error: string | null };

export async function addLineItem(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const t = await getTranslations("Invoices");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const productId = String(formData.get("productId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const unitPriceRaw = String(formData.get("unitPrice") ?? "").trim();

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return { error: t("errorOrgNotFound") };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
  });
  if (!invoice) return { error: t("errorNotFound") };

  if (!description) return { error: t("errorDescriptionRequired") };

  const quantity = Number(quantityRaw);
  if (!quantityRaw || Number.isNaN(quantity) || quantity <= 0) {
    return { error: t("errorInvalidQuantity") };
  }

  const unitPrice = Number(unitPriceRaw);
  if (!unitPriceRaw || Number.isNaN(unitPrice) || unitPrice < 0) {
    return { error: t("errorInvalidPrice") };
  }

  let validProductId: string | null = null;
  if (productId) {
    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId: organization.id, deletedAt: null },
    });
    if (product) validProductId = product.id;
  }

  const position = await prisma.invoiceLineItem.count({ where: { invoiceId } });

  await prisma.invoiceLineItem.create({
    data: { invoiceId, productId: validProductId, description, quantity, unitPrice, position },
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
  return { error: null };
}

export async function removeLineItem(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const lineItemId = String(formData.get("lineItemId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
  });
  if (!invoice) throw new Error("Invoice not found");

  await prisma.invoiceLineItem.deleteMany({ where: { id: lineItemId, invoiceId } });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
}

export async function updateInvoiceStatus(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  if (!INVOICE_STATUSES.includes(statusRaw as (typeof INVOICE_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  await prisma.invoice.updateMany({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
    data: { status: statusRaw as (typeof INVOICE_STATUSES)[number] },
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
  revalidatePath(`/app/${orgSlug}/invoices`);
}

export async function updateInvoiceNotes(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const t = await getTranslations("Invoices");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return { error: t("errorOrgNotFound") };

  const result = await prisma.invoice.updateMany({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
    data: { notes: notes || null },
  });
  if (result.count === 0) return { error: t("errorNotFound") };

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
  return { error: null };
}

// Called directly from a <form action> on the invoice detail page — no
// useActionState, since success is a redirect back to the invoices list.
export async function deleteInvoice(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  await prisma.invoice.updateMany({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/invoices`);
  redirect(`/app/${orgSlug}/invoices`);
}
