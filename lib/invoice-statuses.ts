export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// Explicit allowed transitions — no status can jump directly to any other
// status. Before this existed, updateInvoiceStatus only checked that the new
// value was *a* valid enum member, so e.g. PAID could be set with zero
// payment evidence and reverted to DRAFT just as freely, silently. Adjacent
// transitions only: DRAFT<->SENT<->PAID, one step at a time in either
// direction (SENT->DRAFT covers "recalled before the customer saw it",
// PAID->SENT covers "marked paid by mistake") — but DRAFT<->PAID directly is
// never allowed.
export const ALLOWED_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["DRAFT", "PAID"],
  PAID: ["SENT"],
};

export function isAllowedStatusTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  if (from === to) return true;
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}
