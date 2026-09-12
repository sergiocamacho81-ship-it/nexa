"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getCurrentUser } from "@/app/actions/organizations";
import { createAdminClient } from "@/lib/supabase/admin";
import { INVOICE_STATUSES, isAllowedStatusTransition, type InvoiceStatus } from "@/lib/invoice-statuses";
import { computeInvoiceTotals } from "@/lib/invoice-totals";

// Recomputes and persists subtotal/vatAmount/total from the invoice's current
// line items. Called inside the same transaction as every line-item
// add/remove so the stored total is never out of sync with its line items —
// callers must never derive a total by re-summing line items themselves
// (the previous approach: float conversion on every page render, no stored
// source of truth). The actual arithmetic lives in computeInvoiceTotals
// (lib/invoice-totals.ts), kept separate so it's unit-testable without a
// database connection — this function is just its DB read/write wrapper.
async function recalculateInvoiceTotals(
  tx: Prisma.TransactionClient,
  invoiceId: string,
  vatRate: Prisma.Decimal | null,
) {
  const lineItems = await tx.invoiceLineItem.findMany({
    where: { invoiceId },
    select: { quantity: true, unitPrice: true },
  });

  const { subtotal, vatAmount, total } = computeInvoiceTotals(lineItems, vatRate);

  await tx.invoice.update({
    where: { id: invoiceId },
    data: { subtotal, vatAmount, total },
  });
}

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listInvoices(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.invoice.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { number: "desc" },
  });
}

export async function getInvoice(orgSlug: string, invoiceId: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return null;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
      },
      lineItems: { orderBy: { position: "asc" } },
      statusEvents: { orderBy: { changedAt: "desc" } },
    },
  });
  if (!invoice) return null;

  // Resolve changedByUserId -> email for display, same pattern as
  // listTrash's member-email lookup in app/actions/trash.ts (Prisma has no
  // FK to auth.users to join against, so this goes through the admin API).
  let statusEventsWithEmail = invoice.statusEvents.map((event) => ({ ...event, changedByEmail: null as string | null }));
  const userIds = [...new Set(invoice.statusEvents.map((e) => e.changedByUserId).filter((id): id is string => !!id))];
  if (userIds.length > 0) {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (data) {
      const emailById = new Map(data.users.filter((u) => u.email).map((u) => [u.id, u.email as string]));
      statusEventsWithEmail = invoice.statusEvents.map((event) => ({
        ...event,
        changedByEmail: event.changedByUserId ? (emailById.get(event.changedByUserId) ?? null) : null,
      }));
    }
  }

  return { ...invoice, statusEvents: statusEventsWithEmail };
}

// Called directly from a <form action> on the Deal card — no useActionState,
// since success is a redirect rather than a state update.
//
// Invoice anchors to Job, not Deal directly (see prisma/schema.prisma's Job
// model comment). No dedicated Job create/edit UI exists yet, so this
// find-or-creates a Job per Deal: the first invoice from a given Deal
// creates its Job; every later invoice from the same Deal reuses it (so
// repeated "Create Invoice" clicks accumulate against one Job, matching
// real progress-billing behavior rather than spawning a new Job each time).
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
    let job = await tx.job.findFirst({
      where: { dealId: deal.id, organizationId: organization.id, deletedAt: null },
    });
    if (!job) {
      job = await tx.job.create({
        data: {
          organizationId: organization.id,
          dealId: deal.id,
          companyId: deal.companyId,
          contactId: deal.contactId,
          title: deal.title,
        },
      });
    }

    const org = await tx.organization.update({
      where: { id: organization.id },
      data: { invoiceCounter: { increment: 1 } },
    });
    return tx.invoice.create({
      data: {
        organizationId: organization.id,
        jobId: job.id,
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

  // Issued financial documents must not be silently mutated — once an
  // invoice leaves DRAFT (sent, paid, ...) its line items are locked.
  // Corrections after that point need a credit/adjustment record, not an
  // edit to the original (not built yet — see the Payment domain phase).
  if (invoice.status !== "DRAFT") {
    return { error: t("errorInvoiceLocked") };
  }

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

  await prisma.$transaction(async (tx) => {
    await tx.invoiceLineItem.create({
      data: { invoiceId, productId: validProductId, description, quantity, unitPrice, position },
    });
    await recalculateInvoiceTotals(tx, invoiceId, invoice.vatRate);
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
  if (invoice.status !== "DRAFT") throw new Error("Cannot modify line items on a non-draft invoice");

  await prisma.$transaction(async (tx) => {
    await tx.invoiceLineItem.deleteMany({ where: { id: lineItemId, invoiceId } });
    await recalculateInvoiceTotals(tx, invoiceId, invoice.vatRate);
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
}

export async function updateInvoiceStatus(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  if (!INVOICE_STATUSES.includes(statusRaw as InvoiceStatus)) {
    throw new Error("Invalid status");
  }
  const newStatus = statusRaw as InvoiceStatus;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
    select: { status: true },
  });
  if (!invoice) throw new Error("Invoice not found");

  // Adjacent transitions only — see lib/invoice-statuses.ts. Prevents e.g.
  // DRAFT jumping straight to PAID, or PAID being silently reverted to
  // DRAFT with no record of what happened.
  if (!isAllowedStatusTransition(invoice.status, newStatus)) {
    throw new Error(`Cannot change invoice status from ${invoice.status} to ${newStatus}`);
  }

  if (newStatus !== invoice.status) {
    const user = await getCurrentUser();
    await prisma.$transaction([
      prisma.invoice.updateMany({
        where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
        data: { status: newStatus },
      }),
      prisma.invoiceStatusEvent.create({
        data: {
          invoiceId,
          fromStatus: invoice.status,
          toStatus: newStatus,
          changedByUserId: user?.id ?? null,
        },
      }),
    ]);
  }

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
