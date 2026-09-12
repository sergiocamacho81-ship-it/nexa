"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteAdjustment } from "@/app/actions/invoice-adjustments";

export function DeleteAdjustmentButton({
  orgSlug,
  invoiceId,
  adjustmentId,
}: {
  orgSlug: string;
  invoiceId: string;
  adjustmentId: string;
}) {
  const t = useTranslations("Adjustments");
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
        formData.set("adjustmentId", adjustmentId);
        startTransition(() => deleteAdjustment(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
