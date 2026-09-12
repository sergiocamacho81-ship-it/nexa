export const QUOTE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "DECLINED"] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

// Explicit allowed transitions, same reasoning as ALLOWED_STATUS_TRANSITIONS
// in lib/invoice-statuses.ts: adjacent transitions only, one step at a time.
// SENT->DRAFT covers "recalled before the customer saw it"; ACCEPTED/
// DECLINED->SENT covers "recorded the customer's answer by mistake".
export const ALLOWED_QUOTE_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["DRAFT", "ACCEPTED", "DECLINED"],
  ACCEPTED: ["SENT"],
  DECLINED: ["SENT"],
};

export function isAllowedQuoteStatusTransition(from: QuoteStatus, to: QuoteStatus): boolean {
  if (from === to) return true;
  return ALLOWED_QUOTE_STATUS_TRANSITIONS[from].includes(to);
}
