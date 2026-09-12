"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteQuote } from "@/app/actions/quotes";

export function DeleteQuoteButton({ orgSlug, quoteId }: { orgSlug: string; quoteId: string }) {
  const t = useTranslations("Quotes");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-primary"
      style={{ background: "var(--color-accent-700)", borderColor: "var(--color-accent-700)" }}
      onClick={() => {
        if (!window.confirm(t("deleteConfirm"))) return;
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("quoteId", quoteId);
        startTransition(() => deleteQuote(formData));
      }}
    >
      {t("delete")}
    </button>
  );
}
