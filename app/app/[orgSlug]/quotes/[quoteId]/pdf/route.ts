import { NextRequest } from "next/server";
import { getTranslations, getLocale } from "next-intl/server";
import { getQuoteForPdf } from "@/app/actions/quotes";
import { renderQuotePdfBuffer, type TranslateFn } from "@/lib/pdf/render-quote-pdf";

// @react-pdf/renderer needs real Node APIs (fontkit, yoga-layout) — never
// runs on the Edge runtime.
export const runtime = "nodejs";

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

  const buffer = await renderQuotePdfBuffer(quote, {
    locale,
    t: t as unknown as TranslateFn,
    tStatuses: tStatuses as unknown as TranslateFn,
  });

  const download = request.nextUrl.searchParams.get("download") === "1";
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="quote-${quote.number}.pdf"`,
    },
  });
}
