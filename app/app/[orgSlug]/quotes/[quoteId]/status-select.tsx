"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateQuoteStatus } from "@/app/actions/quotes";
import { ALLOWED_QUOTE_STATUS_TRANSITIONS, type QuoteStatus } from "@/lib/quote-statuses";

export function StatusSelect({
  orgSlug,
  quoteId,
  currentStatus,
}: {
  orgSlug: string;
  quoteId: string;
  currentStatus: QuoteStatus;
}) {
  const tStatuses = useTranslations("QuoteStatuses");
  const [isPending, startTransition] = useTransition();

  // Only offer the current status plus its legal next steps — matches the
  // server-side guard in updateQuoteStatus, so the dropdown never lets
  // someone pick a transition that will just be rejected.
  const selectableStatuses: QuoteStatus[] = [
    currentStatus,
    ...ALLOWED_QUOTE_STATUS_TRANSITIONS[currentStatus],
  ];

  return (
    <select
      className="input"
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("quoteId", quoteId);
        formData.set("status", e.target.value);
        startTransition(() => updateQuoteStatus(formData));
      }}
    >
      {selectableStatuses.map((status) => (
        <option key={status} value={status}>
          {tStatuses(status)}
        </option>
      ))}
    </select>
  );
}
