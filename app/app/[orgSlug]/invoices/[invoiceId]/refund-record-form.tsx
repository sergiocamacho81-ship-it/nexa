"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { recordRefund } from "@/app/actions/payments";
import { PAYMENT_METHODS } from "@/lib/payment-methods";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function RefundRecordForm({ orgSlug, invoiceId }: { orgSlug: string; invoiceId: string }) {
  const t = useTranslations("Payments");
  const tMethods = useTranslations("PaymentMethods");
  const [state, action, isPending] = useActionState(recordRefund, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="refundAmount">{t("amount")}</label>
          <input
            id="refundAmount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="input"
          />
        </div>
        <div className="field">
          <label htmlFor="refundMethod">{t("method")}</label>
          <select id="refundMethod" name="method" className="input" defaultValue="BANK_TRANSFER">
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {tMethods(method)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="refundPaidAt">{t("paidAt")}</label>
          <input
            id="refundPaidAt"
            name="paidAt"
            type="date"
            required
            defaultValue={todayInputValue()}
            className="input"
          />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="refundNotes">{t("notes")}</label>
          <input id="refundNotes" name="notes" type="text" className="input" />
        </div>
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn btn-ghost" style={{ alignSelf: "flex-start" }}>
        {isPending ? t("recordingRefund") : t("recordRefund")}
      </button>
    </form>
  );
}
