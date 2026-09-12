"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { removeQuoteLineItem } from "@/app/actions/quotes";

export function RemoveLineItemButton({
  orgSlug,
  quoteId,
  lineItemId,
}: {
  orgSlug: string;
  quoteId: string;
  lineItemId: string;
}) {
  const t = useTranslations("Quotes");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      style={{ fontSize: "12px", padding: "2px 6px" }}
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("quoteId", quoteId);
        formData.set("lineItemId", lineItemId);
        startTransition(() => removeQuoteLineItem(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
