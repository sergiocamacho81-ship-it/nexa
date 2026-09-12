"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getCurrentUser } from "@/app/actions/organizations";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods";
import { computeEffectiveTotal } from "@/lib/invoice-totals";
import { maybeAdvanceInvoiceToPaid } from "@/app/actions/invoices";

export type PaymentFormState = { error: string | null };

// Shared by recordPayment and recordRefund — a refund is the same record
// with the amount negated (see the Payment model comment in schema.prisma),
// not a separate table, so the validation and write path stay identical
// bar the sign. Only valid once an invoice has actually been issued: a
// still-DRAFT invoice can't have received money against it.
async function saveInvoicePayment(
  formData: FormData,
  sign: 1 | -1,
): Promise<PaymentFormState> {
  const t = await getTranslations("Payments");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const methodRaw = String(formData.get("method") ?? "");
  const paidAtRaw = String(formData.get("paidAt") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return { error: t("errorOrgNotFound") };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: organization.id, deletedAt: null },
    include: {
      payments: { where: { deletedAt: null } },
      adjustments: { where: { deletedAt: null } },
    },
  });
  if (!invoice) return { error: t("errorNotFound") };

  if (invoice.status === "DRAFT") {
    return { error: t("errorInvoiceNotIssued") };
  }

  const enteredAmount = Number(amountRaw);
  if (!amountRaw || Number.isNaN(enteredAmount) || enteredAmount <= 0) {
    return { error: t("errorInvalidAmount") };
  }
  const amount = enteredAmount * sign;

  if (!PAYMENT_METHODS.includes(methodRaw as PaymentMethod)) {
    return { error: t("errorInvalidMethod") };
  }
  const method = methodRaw as PaymentMethod;

  if (!paidAtRaw) {
    return { error: t("errorDateRequired") };
  }

  const user = await getCurrentUser();

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        organizationId: organization.id,
        invoiceId,
        amount,
        method,
        paidAt: new Date(paidAtRaw),
        notes: notes || null,
        recordedByUserId: user?.id ?? null,
      },
    });

    // A refund only ever reduces amountPaid, so it can never newly satisfy
    // "fully paid" — this check runs for both anyway since it's a no-op in
    // that case, and keeping one path avoids two subtly different ones.
    const amountPaid = invoice.payments
      .reduce((sum, p) => sum.plus(p.amount), new Prisma.Decimal(0))
      .plus(amount);
    const effectiveTotal = computeEffectiveTotal(invoice.total, invoice.adjustments);

    await maybeAdvanceInvoiceToPaid(tx, invoiceId, invoice.status, effectiveTotal, amountPaid, user?.id ?? null);
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
  return { error: null };
}

export async function recordPayment(
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  return saveInvoicePayment(formData, 1);
}

// Money paid back to the customer — e.g. correcting an overpayment. Staff
// enter a positive amount ("how much did we refund"); it's stored negative.
export async function recordRefund(
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  return saveInvoicePayment(formData, -1);
}

// Soft-delete, same 30-day Trash pattern as everything else in this app —
// see the Payment model comment for why this deliberately does not
// retroactively revert the invoice's status.
export async function deletePayment(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const paymentId = String(formData.get("paymentId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  await prisma.payment.updateMany({
    where: { id: paymentId, invoiceId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
}
