import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getQuote, convertQuoteToInvoice } from "@/app/actions/quotes";
import { listProducts } from "@/app/actions/products";
import { StatusSelect } from "./status-select";
import { LineItemForm } from "./line-item-form";
import { RemoveLineItemButton } from "./remove-line-item-button";
import { DetailsForm } from "./details-form";
import { DeleteQuoteButton } from "./delete-quote-button";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; quoteId: string }>;
}) {
  const { orgSlug, quoteId } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const [t, tStatuses, locale, quote, products] = await Promise.all([
    getTranslations("Quotes"),
    getTranslations("QuoteStatuses"),
    getLocale(),
    getQuote(orgSlug, quoteId),
    listProducts(orgSlug),
  ]);

  if (!quote) {
    notFound();
  }

  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  // Subtotal/VAT/total are server-computed and persisted (see
  // recalculateQuoteTotals in app/actions/quotes.ts) — read directly, never
  // re-derived from line items here.
  const subtotal = Number(quote.subtotal);
  const vat = Number(quote.vatAmount);
  const total = Number(quote.total);
  const vatRate = quote.vatRate === null ? null : Number(quote.vatRate);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <Link href={`/app/${orgSlug}/quotes`} className="text-muted text-sm">
          ← {t("backToQuotes")}
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h6 className="text-muted" style={{ margin: 0 }}>
              {t("quoteNumber", { number: quote.number })}
            </h6>
            <p className="card-meta">{dateFormatter.format(quote.createdAt)}</p>
            <span className="tag tag-accent">{tStatuses(quote.status)}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusSelect orgSlug={orgSlug} quoteId={quote.id} currentStatus={quote.status} />
            <a
              href={`/app/${orgSlug}/quotes/${quote.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              {t("previewPdf")}
            </a>
            <a href={`/app/${orgSlug}/quotes/${quote.id}/pdf?download=1`} className="btn btn-ghost">
              {t("downloadPdf")}
            </a>
          </div>
        </section>

        {(quote.deal || quote.company || quote.contact) && (
          <section>
            {quote.deal && (
              <p className="card-meta">
                {t("deal")}: <Link href={`/app/${orgSlug}/deals`}>{quote.deal.title}</Link>
              </p>
            )}
            {quote.contact && (
              <p className="card-meta">
                {t("contact")}: {quote.contact.firstName} {quote.contact.lastName ?? ""}
              </p>
            )}
            {quote.company && <p className="card-meta">{quote.company.name}</p>}
          </section>
        )}

        {quote.validUntil && (
          <p className="card-meta">{t("validUntilLabel", { date: dateFormatter.format(quote.validUntil) })}</p>
        )}

        <section>
          <h6 className="text-muted mb-3">{t("lineItemsHeading")}</h6>
          {quote.lineItems.length === 0 ? (
            <p className="text-muted text-sm">{t("noneItems")}</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("description")}</th>
                    <th>{t("quantity")}</th>
                    <th>{t("unitPrice")}</th>
                    <th>{t("lineTotal")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td className="text-muted">{Number(item.quantity)}</td>
                      <td className="text-muted">{currencyFormatter.format(Number(item.unitPrice))}</td>
                      <td className="text-muted">
                        {currencyFormatter.format(Number(item.quantity) * Number(item.unitPrice))}
                      </td>
                      <td>
                        <RemoveLineItemButton orgSlug={orgSlug} quoteId={quote.id} lineItemId={item.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col items-end gap-1" style={{ marginTop: "12px" }}>
            <p className="card-meta">{t("subtotal")}: {currencyFormatter.format(subtotal)}</p>
            <p className="card-meta">
              {vatRate === null ? t("noVat") : t("vat", { rate: vatRate })}: {currencyFormatter.format(vat)}
            </p>
            <p className="card-title">{t("total")}: {currencyFormatter.format(total)}</p>
          </div>
        </section>

        {quote.notes && (
          <section>
            <p className="card-meta" style={{ whiteSpace: "pre-wrap" }}>{quote.notes}</p>
          </section>
        )}

        {quote.invoices.length > 0 && (
          <section>
            <p className="card-meta">
              {t("convertedTo")}:{" "}
              {quote.invoices
                .map((invoice) => (
                  <Link key={invoice.id} href={`/app/${orgSlug}/invoices/${invoice.id}`}>
                    {t("invoiceNumber", { number: invoice.number })}
                  </Link>
                ))
                .reduce((acc, el) => (acc.length === 0 ? [el] : [...acc, ", ", el]), [] as React.ReactNode[])}
            </p>
          </section>
        )}

        {quote.status === "ACCEPTED" && (
          <section>
            <form action={convertQuoteToInvoice}>
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <input type="hidden" name="quoteId" value={quote.id} />
              <button type="submit" className="btn btn-primary">
                {t("convertToInvoice")}
              </button>
            </form>
          </section>
        )}
      </div>

      <section>
        <h6 className="text-muted mb-3">{t("addLineItem")}</h6>
        <LineItemForm
          orgSlug={orgSlug}
          quoteId={quote.id}
          products={products.map((p) => ({ ...p, unitPrice: Number(p.unitPrice) }))}
        />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("detailsHeading")}</h6>
        <DetailsForm orgSlug={orgSlug} quoteId={quote.id} notes={quote.notes} validUntil={quote.validUntil} />
      </section>

      <section>
        <DeleteQuoteButton orgSlug={orgSlug} quoteId={quote.id} />
      </section>
    </div>
  );
}
