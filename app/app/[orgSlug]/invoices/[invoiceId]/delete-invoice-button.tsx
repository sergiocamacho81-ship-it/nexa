"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteInvoice } from "@/app/actions/invoices";

export function DeleteInvoiceButton({ orgSlug, invoiceId }: { orgSlug: string; invoiceId: string }) {
  const t = useTranslations("Invoices");
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
        formData.set("invoiceId", invoiceId);
        startTransition(() => deleteInvoice(formData));
      }}
    >
      {t("delete")}
    </button>
  );
}
