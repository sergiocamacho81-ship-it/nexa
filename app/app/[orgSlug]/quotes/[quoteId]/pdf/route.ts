import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslations, getLocale } from "next-intl/server";
import { getQuoteForPdf } from "@/app/actions/quotes";
import { QuotePdfDocument } from "@/lib/pdf/quote-pdf";

// @react-pdf/renderer needs real Node APIs (fontkit, yoga-layout) — never
// runs on the Edge runtime.
export const runtime = "nodejs";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; quoteId: string }> },
) {
  const { orgSlug, quoteId } = await params;
  const quote = await getQuoteForPdf(orgSlug, quoteId);
  if (!quote) {
    return new Response("Not found", { status: 404 });
  }

  const [t, tStatuses, locale] = await Promise.all([
    getTranslations("Quotes"),
    getTranslations("QuoteStatuses"),
    getLocale(),
  ]);

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

  const buffer = await renderToBuffer(
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

  const download = request.nextUrl.searchParams.get("download") === "1";
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="quote-${quote.number}.pdf"`,
    },
  });
}
