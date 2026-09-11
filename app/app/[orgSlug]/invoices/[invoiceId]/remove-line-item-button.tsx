"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { removeLineItem } from "@/app/actions/invoices";

export function RemoveLineItemButton({
  orgSlug,
  invoiceId,
  lineItemId,
}: {
  orgSlug: string;
  invoiceId: string;
  lineItemId: string;
}) {
  const t = useTranslations("Invoices");
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
        formData.set("invoiceId", invoiceId);
        formData.set("lineItemId", lineItemId);
        startTransition(() => removeLineItem(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
