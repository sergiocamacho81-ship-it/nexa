"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateInvoiceStatus } from "@/app/actions/invoices";
import { ALLOWED_STATUS_TRANSITIONS, type InvoiceStatus } from "@/lib/invoice-statuses";

export function StatusSelect({
  orgSlug,
  invoiceId,
  currentStatus,
}: {
  orgSlug: string;
  invoiceId: string;
  currentStatus: InvoiceStatus;
}) {
  const tStatuses = useTranslations("InvoiceStatuses");
  const [isPending, startTransition] = useTransition();

  // Only offer the current status plus its legal next steps — matches the
  // server-side guard in updateInvoiceStatus, so the dropdown never lets
  // someone pick a transition that will just be rejected.
  const selectableStatuses: InvoiceStatus[] = [
    currentStatus,
    ...ALLOWED_STATUS_TRANSITIONS[currentStatus],
  ];

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
      {selectableStatuses.map((status) => (
        <option key={status} value={status}>
          {tStatuses(status)}
        </option>
      ))}
    </select>
  );
}
