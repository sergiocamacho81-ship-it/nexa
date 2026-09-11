"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateInvoiceStatus } from "@/app/actions/invoices";
import { INVOICE_STATUSES } from "@/lib/invoice-statuses";

export function StatusSelect({
  orgSlug,
  invoiceId,
  currentStatus,
}: {
  orgSlug: string;
  invoiceId: string;
  currentStatus: (typeof INVOICE_STATUSES)[number];
}) {
  const tStatuses = useTranslations("InvoiceStatuses");
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="input"
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("invoiceId", invoiceId);
        formData.set("status", e.target.value);
        startTransition(() => updateInvoiceStatus(formData));
      }}
    >
      {INVOICE_STATUSES.map((status) => (
        <option key={status} value={status}>
          {tStatuses(status)}
        </option>
      ))}
    </select>
  );
}
