import { Prisma } from "@prisma/client";

// Pure calculation, deliberately separated from recalculateInvoiceTotals'
// database read/write (app/actions/invoices.ts) so it's unit-testable
// without a live database connection. Uses Prisma.Decimal arithmetic
// throughout — never Number()/float conversion, which is exactly the bug
// this replaced (see the Invoice.subtotal/vatAmount/total schema comment).
export function computeInvoiceTotals(
  lineItems: { quantity: Prisma.Decimal | number | string; unitPrice: Prisma.Decimal | number | string }[],
  vatRate: Prisma.Decimal | number | string | null,
): { subtotal: Prisma.Decimal; vatAmount: Prisma.Decimal; total: Prisma.Decimal } {
  const subtotal = lineItems.reduce(
    (sum, item) => sum.plus(new Prisma.Decimal(item.quantity).times(new Prisma.Decimal(item.unitPrice))),
    new Prisma.Decimal(0),
  );
  const vatAmount =
    vatRate === null ? new Prisma.Decimal(0) : subtotal.times(new Prisma.Decimal(vatRate)).dividedBy(100);
  const total = subtotal.plus(vatAmount);

  return { subtotal, vatAmount, total };
}

// Layers non-deleted InvoiceAdjustment amounts on top of the persisted
// total — never mutates Invoice.total itself (see the InvoiceAdjustment
// schema comment for why: the original issued figure must stay intact).
// Negative adjustment amounts are credits/reductions, positive are added
// charges; both are just summed.
export function computeEffectiveTotal(
  total: Prisma.Decimal | number | string,
  adjustments: { amount: Prisma.Decimal | number | string }[],
): Prisma.Decimal {
  return adjustments.reduce(
    (sum, adjustment) => sum.plus(new Prisma.Decimal(adjustment.amount)),
    new Prisma.Decimal(total),
  );
}
