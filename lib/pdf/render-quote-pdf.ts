import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdfDocument } from "./quote-pdf";
import type { getQuoteForPdf } from "@/app/actions/quotes";

// Shared by the PDF route handler (in-browser preview/download) and
// sendQuoteEmail (PDF attachment) so both produce byte-identical documents
// from a single formatting pass — never duplicate this logic.
export type QuoteForPdf = NonNullable<Awaited<ReturnType<typeof getQuoteForPdf>>>;

// A next-intl Translator's call signature is keyed to a literal union
// derived from messages/en.json, which doesn't structurally widen to a
// plain function type — callers cast their scoped translator to this shape
// at the boundary instead of this helper accepting `any`.
export type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

function formatAddress(entity: {
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
  countryCode: string | null;
}): string[] {
  const lines: string[] = [];
  if (entity.addressLine) lines.push(entity.addressLine);
  const cityLine = [entity.postalCode, entity.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (entity.countryCode) lines.push(entity.countryCode);
  return lines;
}

export async function renderQuotePdfBuffer(
  quote: QuoteForPdf,
  {
    locale,
    t,
    tStatuses,
  }: {
    locale: string;
    t: TranslateFn;
    tStatuses: TranslateFn;
  },
): Promise<Buffer> {
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const billToName = quote.company
    ? quote.company.name
    : quote.contact
      ? `${quote.contact.firstName} ${quote.contact.lastName ?? ""}`.trim()
      : null;
  const billToAddressLines = quote.company
    ? formatAddress(quote.company)
    : quote.contact
      ? formatAddress(quote.contact)
      : [];

  const vatRate = quote.vatRate === null ? null : Number(quote.vatRate);

  return renderToBuffer(
    QuotePdfDocument({
      organizationName: quote.organization.name,
      quoteNumberLabel: t("quoteNumber", { number: quote.number }),
      statusLabel: tStatuses(quote.status),
      dateLabel: dateFormatter.format(quote.createdAt),
      validUntilLabel: quote.validUntil
        ? t("validUntilLabel", { date: dateFormatter.format(quote.validUntil) })
        : null,
      billToName,
      billToAddressLines,
      lineItems: quote.lineItems.map((item) => ({
        description: item.description,
        quantity: String(Number(item.quantity)),
        unitPrice: currencyFormatter.format(Number(item.unitPrice)),
        lineTotal: currencyFormatter.format(Number(item.quantity) * Number(item.unitPrice)),
      })),
      labels: {
        billTo: t("billTo"),
        description: t("description"),
        quantity: t("quantity"),
        unitPrice: t("unitPrice"),
        lineTotal: t("lineTotal"),
        subtotal: t("subtotal"),
        vat: vatRate === null ? t("noVat") : t("vat", { rate: vatRate }),
        total: t("total"),
        notes: t("detailsHeading"),
      },
      subtotalLabel: currencyFormatter.format(Number(quote.subtotal)),
      vatLabel: currencyFormatter.format(Number(quote.vatAmount)),
      totalLabel: currencyFormatter.format(Number(quote.total)),
      notes: quote.notes,
    }),
  );
}
