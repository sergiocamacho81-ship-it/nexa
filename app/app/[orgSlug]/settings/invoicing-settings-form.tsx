"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateOrgInvoicing } from "@/app/actions/settings";

export function InvoicingSettingsForm({
  orgSlug,
  invoiceVatRate,
  disabled,
}: {
  orgSlug: string;
  invoiceVatRate: number | null;
  disabled: boolean;
}) {
  const t = useTranslations("Settings");
  const [state, action, isPending] = useActionState(updateOrgInvoicing, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="field" style={{ maxWidth: "220px" }}>
        <label htmlFor="invoiceVatRate">{t("vatRate")}</label>
        <input
          id="invoiceVatRate"
          name="invoiceVatRate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          disabled={disabled}
          defaultValue={invoiceVatRate ?? ""}
          className="input"
        />
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || disabled}
        className="btn btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        {isPending ? t("saving") : t("save")}
      </button>
    </form>
  );
}
