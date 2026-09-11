import { describe, expect, it } from "vitest";
import { ALLOWED_STATUS_TRANSITIONS, isAllowedStatusTransition, INVOICE_STATUSES } from "./invoice-statuses";

describe("isAllowedStatusTransition", () => {
  it("allows a status to stay the same", () => {
    for (const status of INVOICE_STATUSES) {
      expect(isAllowedStatusTransition(status, status)).toBe(true);
    }
  });

  it("allows every adjacent forward/backward transition", () => {
    expect(isAllowedStatusTransition("DRAFT", "SENT")).toBe(true);
    expect(isAllowedStatusTransition("SENT", "DRAFT")).toBe(true);
    expect(isAllowedStatusTransition("SENT", "PAID")).toBe(true);
    expect(isAllowedStatusTransition("PAID", "SENT")).toBe(true);
  });

  it("rejects skipping a state — the exact bug this guard exists to prevent", () => {
    // Before this guard existed, an invoice could be marked PAID with zero
    // payment evidence and reverted to DRAFT just as freely, in one step.
    expect(isAllowedStatusTransition("DRAFT", "PAID")).toBe(false);
    expect(isAllowedStatusTransition("PAID", "DRAFT")).toBe(false);
  });

  it("has no transition target outside the three known statuses", () => {
    for (const from of INVOICE_STATUSES) {
      for (const to of ALLOWED_STATUS_TRANSITIONS[from]) {
        expect(INVOICE_STATUSES).toContain(to);
      }
    }
  });
});
