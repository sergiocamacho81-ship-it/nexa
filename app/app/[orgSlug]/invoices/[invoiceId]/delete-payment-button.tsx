"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deletePayment } from "@/app/actions/payments";

export function DeletePaymentButton({
  orgSlug,
  invoiceId,
  paymentId,
}: {
  orgSlug: string;
  invoiceId: string;
  paymentId: string;
}) {
  const t = useTranslations("Payments");
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
        formData.set("paymentId", paymentId);
        startTransition(() => deletePayment(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
