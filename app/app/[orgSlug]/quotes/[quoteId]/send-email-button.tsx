"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendQuoteEmail } from "@/app/actions/quotes";

export function SendEmailButton({ orgSlug, quoteId }: { orgSlug: string; quoteId: string }) {
  const t = useTranslations("Quotes");
  const [state, action, isPending] = useActionState(sendQuoteEmail, { error: null });

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending ? t("sending") : t("send")}
      </button>
      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}
    </form>
  );
}
