"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateInvoiceNotes } from "@/app/actions/invoices";

export function NotesForm({
  orgSlug,
  invoiceId,
  notes,
}: {
  orgSlug: string;
  invoiceId: string;
  notes: string | null;
}) {
  const t = useTranslations("Invoices");
  const [state, action, isPending] = useActionState(updateInvoiceNotes, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="invoiceId" value={invoiceId} />
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
        {isPending ? t("saving") : t("saveNotes")}
      </button>
    </form>
  );
}
