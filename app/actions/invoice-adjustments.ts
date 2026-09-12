"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getCurrentUser } from "@/app/actions/organizations";
import { computeEffectiveTotal } from "@/lib/invoice-totals";
import { maybeAdvanceInvoiceToPaid } from "@/app/actions/invoices";

export type AdjustmentFormState = { error: string | null };

// Corrects the amount owed on an already-issued invoice without touching
// its locked line items — see the InvoiceAdjustment model comment in
// schema.prisma. amount is signed: a negative value is a credit/reduction
// (the common case — e.g. "forgot to apply a discount"), positive adds a
// charge (e.g. "missed an expense"). Same DRAFT gate as recordPayment:
// correcting a still-draft invoice means just editing its line items
// directly, not layering an adjustment on top.
export async function recordAdjustment(
  _prevState: AdjustmentFormState,
  formData: FormData,
): Promise<AdjustmentFormState> {
  const t = await getTranslations("Adjustments");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

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

  const amount = Number(amountRaw);
  if (!amountRaw || Number.isNaN(amount) || amount === 0) {
    return { error: t("errorInvalidAmount") };
  }

  if (!reason) {
    return { error: t("errorReasonRequired") };
  }

  const user = await getCurrentUser();

  await prisma.$transaction(async (tx) => {
    await tx.invoiceAdjustment.create({
      data: {
        organizationId: organization.id,
        invoiceId,
        amount,
        reason,
        createdByUserId: user?.id ?? null,
      },
    });

    const amountPaid = invoice.payments.reduce(
      (sum, p) => sum.plus(p.amount),
      new Prisma.Decimal(0),
    );
    const effectiveTotal = computeEffectiveTotal(invoice.total, invoice.adjustments).plus(amount);

    await maybeAdvanceInvoiceToPaid(tx, invoiceId, invoice.status, effectiveTotal, amountPaid, user?.id ?? null);
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
  return { error: null };
}

// Soft-delete, same 30-day Trash pattern as everything else — reversing an
// adjustment does NOT retroactively revert Invoice.status, same reasoning
// as deletePayment.
export async function deleteAdjustment(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const adjustmentId = String(formData.get("adjustmentId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");

  await prisma.invoiceAdjustment.updateMany({
    where: { id: adjustmentId, invoiceId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/invoices/${invoiceId}`);
}
