"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getCurrentUser } from "@/app/actions/organizations";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods";

export type PaymentFormState = { error: string | null };

// Records a manual payment against an invoice (typed in by staff — no
// online collection or bank feed; see the Payment model comment in
// schema.prisma for why that's deliberately out of scope here). Only valid
// once an invoice has actually been issued: a still-DRAFT invoice can't
// have received money against it. If this payment brings the invoice to
// fully paid (or beyond — overpayment is allowed, not blocked), it's
// auto-advanced to PAID through the same audited path as a manual status
// change; it is never auto-reverted if a payment is later removed (see
// deletePayment) — amountPaid/amountDue always reflect live payment totals
// regardless of what the status field says.
export async function recordPayment(
  _prevState: PaymentFormState,
  formData: FormData,
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
    include: { payments: { where: { deletedAt: null } } },
  });
  if (!invoice) return { error: t("errorNotFound") };

  if (invoice.status === "DRAFT") {
    return { error: t("errorInvoiceNotIssued") };
  }

  const amount = Number(amountRaw);
  if (!amountRaw || Number.isNaN(amount) || amount <= 0) {
    return { error: t("errorInvalidAmount") };
  }

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

    const amountPaid = invoice.payments
      .reduce((sum, p) => sum.plus(p.amount), new Prisma.Decimal(0))
      .plus(amount);

    if (invoice.status === "SENT" && amountPaid.greaterThanOrEqualTo(invoice.total)) {
      await tx.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });
      await tx.invoiceStatusEvent.create({
        data: {
          invoiceId,
          fromStatus: "SENT",
          toStatus: "PAID",
          changedByUserId: user?.id ?? null,
        },
      });
    }
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
  return { error: null };
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
