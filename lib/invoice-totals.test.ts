import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { computeInvoiceTotals, computeEffectiveTotal } from "./invoice-totals";

function d(value: string) {
  return new Prisma.Decimal(value);
}

describe("computeInvoiceTotals", () => {
  it("returns zero for an invoice with no line items", () => {
    const result = computeInvoiceTotals([], null);
    expect(result.subtotal.toString()).toBe("0");
    expect(result.vatAmount.toString()).toBe("0");
    expect(result.total.toString()).toBe("0");
  });

  it("computes a single line item with no VAT", () => {
    const result = computeInvoiceTotals([{ quantity: "2", unitPrice: "50.00" }], null);
    expect(result.subtotal.toString()).toBe("100");
    expect(result.vatAmount.toString()).toBe("0");
    expect(result.total.toString()).toBe("100");
  });

  it("applies the current Swiss standard VAT rate (8.1%) correctly", () => {
    const result = computeInvoiceTotals([{ quantity: "1", unitPrice: "100.00" }], d("8.1"));
    expect(result.subtotal.toString()).toBe("100");
    expect(result.vatAmount.toString()).toBe("8.1");
    expect(result.total.toString()).toBe("108.1");
  });

  it("sums multiple line items exactly", () => {
    const result = computeInvoiceTotals(
      [
        { quantity: "3", unitPrice: "19.90" },
        { quantity: "1", unitPrice: "4.35" },
      ],
      null,
    );
    // 3 * 19.90 = 59.70, + 4.35 = 64.05
    expect(result.subtotal.toString()).toBe("64.05");
  });

  // The exact bug this whole module exists to avoid: with plain JS Number()
  // arithmetic (the old approach, computed fresh on every page render),
  // 0.1 + 0.2 !== 0.3 due to binary floating point. Decimal arithmetic must
  // not exhibit this.
  it("does not exhibit binary-floating-point rounding error", () => {
    const result = computeInvoiceTotals(
      [
        { quantity: "1", unitPrice: "0.10" },
        { quantity: "1", unitPrice: "0.20" },
      ],
      null,
    );
    expect(result.subtotal.toString()).toBe("0.3");
    expect(Number(result.subtotal) === 0.1 + 0.2).toBe(false); // sanity: the float trap this replaces
  });

  it.each(["0.01", "0.02", "0.05", "0.10", "0.99", "1.00", "1.01"])(
    "handles the CHF %s boundary value exactly, with VAT applied",
    (amount) => {
      const result = computeInvoiceTotals([{ quantity: "1", unitPrice: amount }], d("8.1"));
      const expectedVat = d(amount).times(d("8.1")).dividedBy(100);
      expect(result.vatAmount.toString()).toBe(expectedVat.toString());
      expect(result.total.toString()).toBe(d(amount).plus(expectedVat).toString());
    },
  );

  it("treats a null VAT rate as no VAT, distinct from a 0% rate", () => {
    const noVat = computeInvoiceTotals([{ quantity: "1", unitPrice: "100" }], null);
    const zeroVat = computeInvoiceTotals([{ quantity: "1", unitPrice: "100" }], d("0"));
    expect(noVat.vatAmount.toString()).toBe("0");
    expect(zeroVat.vatAmount.toString()).toBe("0");
    // Both currently produce the same numeric result — flagged deliberately:
    // once the Swiss compliance phase introduces VatTreatment (SWISS_VAT vs
    // OUTSIDE_SCOPE_SWISS_VAT vs VAT_EXEMPT vs ZERO_RATED etc.), "no rate"
    // and "0% rate" must stop being numerically interchangeable — see
    // docs/compliance/swiss-vat.md. This test documents today's behavior,
    // not an endorsement of treating them as equivalent long-term.
    expect(noVat.total.toString()).toBe(zeroVat.total.toString());
  });
});

describe("computeEffectiveTotal", () => {
  it("returns the original total unchanged when there are no adjustments", () => {
    expect(computeEffectiveTotal(d("100.00"), []).toString()).toBe("100");
  });

  it("reduces the total for a negative (credit) adjustment", () => {
    expect(computeEffectiveTotal(d("100.00"), [{ amount: "-20.00" }]).toString()).toBe("80");
  });

  it("increases the total for a positive (added charge) adjustment", () => {
    expect(computeEffectiveTotal(d("100.00"), [{ amount: "15.00" }]).toString()).toBe("115");
  });

  it("sums multiple adjustments exactly, without floating-point error", () => {
    const result = computeEffectiveTotal(d("100.00"), [
      { amount: "-0.10" },
      { amount: "-0.20" },
    ]);
    expect(result.toString()).toBe("99.7");
  });

  it("can bring the effective total to exactly zero or negative", () => {
    expect(computeEffectiveTotal(d("50.00"), [{ amount: "-50.00" }]).toString()).toBe("0");
    expect(computeEffectiveTotal(d("50.00"), [{ amount: "-75.00" }]).toString()).toBe("-25");
  });
});
