"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateQuoteDetails } from "@/app/actions/quotes";

function toDateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function DetailsForm({
  orgSlug,
  quoteId,
  notes,
  validUntil,
}: {
  orgSlug: string;
  quoteId: string;
  notes: string | null;
  validUntil: Date | null;
}) {
  const t = useTranslations("Quotes");
  const [state, action, isPending] = useActionState(updateQuoteDetails, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <div className="field">
        <label htmlFor="validUntil">{t("validUntil")}</label>
        <input
          id="validUntil"
          name="validUntil"
          type="date"
          defaultValue={toDateInputValue(validUntil)}
          className="input"
          style={{ maxWidth: "200px" }}
        />
      </div>
      <textarea
        name="notes"
        rows={3}
        defaultValue={notes ?? ""}
        placeholder={t("notesPlaceholder")}
        className="input"
      />
      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={isPending} className="btn btn-ghost" style={{ alignSelf: "flex-start" }}>
        {isPending ? t("saving") : t("saveDetails")}
      </button>
    </form>
  );
}
