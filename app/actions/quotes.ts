"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { QUOTE_STATUSES, isAllowedQuoteStatusTransition, type QuoteStatus } from "@/lib/quote-statuses";
import { computeInvoiceTotals } from "@/lib/invoice-totals";
import { getSmtpTransport, getSmtpFromAddress } from "@/lib/smtp";
import { renderEmailHtml } from "@/lib/email-template";
import { renderQuotePdfBuffer, type TranslateFn } from "@/lib/pdf/render-quote-pdf";
import { logError } from "@/lib/log";

// Recomputes and persists subtotal/vatAmount/total from the quote's current
// line items — same reasoning and same arithmetic as
// recalculateInvoiceTotals in app/actions/invoices.ts.
async function recalculateQuoteTotals(
  tx: Prisma.TransactionClient,
  quoteId: string,
  vatRate: Prisma.Decimal | null,
) {
  const lineItems = await tx.quoteLineItem.findMany({
    where: { quoteId },
    select: { quantity: true, unitPrice: true },
  });

  const { subtotal, vatAmount, total } = computeInvoiceTotals(lineItems, vatRate);

  await tx.quote.update({
    where: { id: quoteId },
    data: { subtotal, vatAmount, total },
  });
}

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listQuotes(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.quote.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { number: "desc" },
  });
}

export async function getQuote(orgSlug: string, quoteId: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return null;

  return prisma.quote.findFirst({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
    include: {
      deal: { select: { id: true, title: true } },
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      lineItems: { orderBy: { position: "asc" } },
      invoices: { where: { deletedAt: null }, select: { id: true, number: true } },
    },
  });
}

// Same record as getQuote but with the extra fields (org name, full
// company/contact address) the PDF template needs and the on-screen detail
// page doesn't.
export async function getQuoteForPdf(orgSlug: string, quoteId: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return null;

  return prisma.quote.findFirst({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
    include: {
      organization: { select: { name: true } },
      company: {
        select: {
          name: true,
          addressLine: true,
          city: true,
          postalCode: true,
          canton: true,
          countryCode: true,
        },
      },
      contact: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          addressLine: true,
          city: true,
          postalCode: true,
          canton: true,
          countryCode: true,
        },
      },
      lineItems: { orderBy: { position: "asc" } },
    },
  });
}

// Called directly from a <form action> on the Deal card — no useActionState,
// since success is a redirect rather than a state update. Copies
// company/contact from the Deal at creation time, same as Job/Project.
export async function createQuoteForDeal(formData: FormData) {
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

  const quote = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: organization.id },
      data: { quoteCounter: { increment: 1 } },
    });
    return tx.quote.create({
      data: {
        organizationId: organization.id,
        dealId: deal.id,
        companyId: deal.companyId,
        contactId: deal.contactId,
        number: org.quoteCounter,
        vatRate: organization.invoiceVatRate,
      },
    });
  });

  revalidatePath(`/app/${orgSlug}/deals`);
  redirect(`/app/${orgSlug}/quotes/${quote.id}`);
}

export type QuoteFormState = { error: string | null };

export async function addQuoteLineItem(
  _prevState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const t = await getTranslations("Quotes");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const productId = String(formData.get("productId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const unitPriceRaw = String(formData.get("unitPrice") ?? "").trim();

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return { error: t("errorOrgNotFound") };

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
  });
  if (!quote) return { error: t("errorNotFound") };

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

  const position = await prisma.quoteLineItem.count({ where: { quoteId } });

  await prisma.$transaction(async (tx) => {
    await tx.quoteLineItem.create({
      data: { quoteId, productId: validProductId, description, quantity, unitPrice, position },
    });
    await recalculateQuoteTotals(tx, quoteId, quote.vatRate);
  });

  revalidatePath(`/app/${orgSlug}/quotes/${quoteId}`);
  return { error: null };
}

export async function removeQuoteLineItem(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const lineItemId = String(formData.get("lineItemId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
  });
  if (!quote) throw new Error("Quote not found");

  await prisma.$transaction(async (tx) => {
    await tx.quoteLineItem.deleteMany({ where: { id: lineItemId, quoteId } });
    await recalculateQuoteTotals(tx, quoteId, quote.vatRate);
  });

  revalidatePath(`/app/${orgSlug}/quotes/${quoteId}`);
}

export async function updateQuoteStatus(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  if (!QUOTE_STATUSES.includes(statusRaw as QuoteStatus)) {
    throw new Error("Invalid status");
  }
  const newStatus = statusRaw as QuoteStatus;

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
    select: { status: true },
  });
  if (!quote) throw new Error("Quote not found");

  // Adjacent transitions only — see lib/quote-statuses.ts.
  if (!isAllowedQuoteStatusTransition(quote.status, newStatus)) {
    throw new Error(`Cannot change quote status from ${quote.status} to ${newStatus}`);
  }

  await prisma.quote.updateMany({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
    data: { status: newStatus },
  });

  revalidatePath(`/app/${orgSlug}/quotes/${quoteId}`);
  revalidatePath(`/app/${orgSlug}/quotes`);
}

export async function updateQuoteDetails(
  _prevState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const t = await getTranslations("Quotes");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const validUntilRaw = String(formData.get("validUntil") ?? "").trim();

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return { error: t("errorOrgNotFound") };

  const result = await prisma.quote.updateMany({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
    data: {
      notes: notes || null,
      validUntil: validUntilRaw ? new Date(validUntilRaw) : null,
    },
  });
  if (result.count === 0) return { error: t("errorNotFound") };

  revalidatePath(`/app/${orgSlug}/quotes/${quoteId}`);
  return { error: null };
}

// Called directly from a <form action> on the quote detail page — no
// useActionState, since success is a redirect back to the quotes list.
export async function deleteQuote(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  await prisma.quote.updateMany({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/quotes`);
  redirect(`/app/${orgSlug}/quotes`);
}

// Creates an Invoice from an accepted Quote's line items — the "quote-to-
// invoice traceability" piece: sets Invoice.quoteId so the two stay linked.
// Reuses the same find-or-create-Job-per-Deal pattern as
// createInvoiceForDeal in app/actions/invoices.ts when the quote has a Deal.
// Called directly from a <form action>, redirects to the new invoice.
export async function convertQuoteToInvoice(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, organizationId: organization.id, deletedAt: null },
    include: { lineItems: true },
  });
  if (!quote) {
    throw new Error("Quote not found");
  }
  if (quote.status !== "ACCEPTED") {
    throw new Error("Only an accepted quote can be converted to an invoice");
  }

  const invoice = await prisma.$transaction(async (tx) => {
    let jobId: string | null = null;
    if (quote.dealId) {
      let job = await tx.job.findFirst({
        where: { dealId: quote.dealId, organizationId: organization.id, deletedAt: null },
      });
      if (!job) {
        const deal = await tx.deal.findFirst({ where: { id: quote.dealId } });
        job = await tx.job.create({
          data: {
            organizationId: organization.id,
            dealId: quote.dealId,
            companyId: quote.companyId,
            contactId: quote.contactId,
            title: deal?.title ?? "",
          },
        });
      }
      jobId = job.id;
    }

    const org = await tx.organization.update({
      where: { id: organization.id },
      data: { invoiceCounter: { increment: 1 } },
    });

    const created = await tx.invoice.create({
      data: {
        organizationId: organization.id,
        jobId,
        quoteId: quote.id,
        number: org.invoiceCounter,
        vatRate: quote.vatRate,
      },
    });

    if (quote.lineItems.length > 0) {
      await tx.invoiceLineItem.createMany({
        data: quote.lineItems.map((item) => ({
          invoiceId: created.id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          position: item.position,
        })),
      });
    }

    const { subtotal, vatAmount, total } = computeInvoiceTotals(quote.lineItems, quote.vatRate);
    await tx.invoice.update({
      where: { id: created.id },
      data: { subtotal, vatAmount, total },
    });

    return created;
  });

  revalidatePath(`/app/${orgSlug}/quotes/${quoteId}`);
  redirect(`/app/${orgSlug}/invoices/${invoice.id}`);
}

// Actually delivers the quote by email (org's own SMTP, same as
// app/actions/emails.ts's sendEmail) with the PDF attached — unlike
// Invoice's "Sent" status, which is just a manual flip. On success, flips
// the quote to SENT (only from DRAFT, guarded against a stale client
// re-submitting after the quote already moved on elsewhere) and logs an
// EmailMessage the same way sendEmail does, so it shows up in the org's
// email history either way.
export async function sendQuoteEmail(
  _prevState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const t = await getTranslations("Quotes");
  const tStatuses = await getTranslations("QuoteStatuses");
  const locale = await getLocale();
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return { error: t("errorOrgNotFound") };

  const quote = await getQuoteForPdf(orgSlug, quoteId);
  if (!quote) return { error: t("errorNotFound") };

  const toAddress = quote.contact?.email?.trim();
  if (!toAddress) {
    return { error: t("errorNoRecipientEmail") };
  }

  const transport = getSmtpTransport(organization);
  const fromAddress = getSmtpFromAddress(organization);
  if (!transport || !fromAddress) {
    return { error: t("errorSmtpNotConfigured") };
  }

  const buffer = await renderQuotePdfBuffer(quote, {
    locale,
    t: t as unknown as TranslateFn,
    tStatuses: tStatuses as unknown as TranslateFn,
  });
  const subject = t("emailSubject", { number: quote.number, orgName: quote.organization.name });
  const body = t("emailBody", { number: quote.number });

  let status: "SENT" | "FAILED" = "SENT";
  let error: string | null = null;

  try {
    await transport.sendMail({
      from: fromAddress,
      to: toAddress,
      subject,
      text: body,
      html: renderEmailHtml({ subject, body }),
      attachments: [
        { filename: `quote-${quote.number}.pdf`, content: buffer, contentType: "application/pdf" },
      ],
    });
  } catch (err) {
    status = "FAILED";
    error = err instanceof Error ? err.message : "Unknown error while sending the email.";
    logError("quotes.sendQuoteEmail", err, { organizationId: organization.id, quoteId });
  }

  await prisma.emailMessage.create({
    data: {
      organizationId: organization.id,
      contactId: quote.contactId,
      dealId: quote.dealId,
      fromAddress,
      toAddress,
      subject,
      body,
      status,
      error,
    },
  });

  if (status === "FAILED") {
    return { error };
  }

  await prisma.quote.updateMany({
    where: { id: quoteId, organizationId: organization.id, status: "DRAFT" },
    data: { status: "SENT" },
  });

  revalidatePath(`/app/${orgSlug}/quotes/${quoteId}`);
  revalidatePath(`/app/${orgSlug}/quotes`);
  return { error: null };
}
