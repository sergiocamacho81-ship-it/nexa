"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { recordAdjustment } from "@/app/actions/invoice-adjustments";

export function AdjustmentRecordForm({ orgSlug, invoiceId }: { orgSlug: string; invoiceId: string }) {
  const t = useTranslations("Adjustments");
  const [state, action, isPending] = useActionState(recordAdjustment, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="adjustmentAmount">{t("amount")}</label>
          <input
            id="adjustmentAmount"
            name="amount"
            type="number"
            step="0.01"
            required
            className="input"
            placeholder={t("amountPlaceholder")}
          />
        </div>
        <div className="field">
          <label htmlFor="adjustmentReason">{t("reason")}</label>
          <input id="adjustmentReason" name="reason" type="text" required className="input" />
        </div>
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
        {isPending ? t("recording") : t("record")}
      </button>
    </form>
  );
}
