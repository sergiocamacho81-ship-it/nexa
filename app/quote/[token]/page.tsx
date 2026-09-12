import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getQuoteByToken, acceptQuotePublic, declineQuotePublic } from "@/app/actions/quotes-public";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);
  if (!quote) {
    notFound();
  }

  const [t, tQuotes, tStatuses, locale] = await Promise.all([
    getTranslations("PublicQuote"),
    getTranslations("Quotes"),
    getTranslations("QuoteStatuses"),
    getLocale(),
  ]);

  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const recipientName = quote.company
    ? quote.company.name
    : quote.contact
      ? `${quote.contact.firstName} ${quote.contact.lastName ?? ""}`.trim()
      : null;

  const subtotal = Number(quote.subtotal);
  const vat = Number(quote.vatAmount);
  const total = Number(quote.total);
  const vatRate = quote.vatRate === null ? null : Number(quote.vatRate);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted" style={{ margin: 0 }}>
          {quote.organization.name}
        </h6>
        <p className="card-title" style={{ margin: 0 }}>
          {tQuotes("quoteNumber", { number: quote.number })}
        </p>
        {recipientName && <p className="card-meta">{t("greeting", { name: recipientName })}</p>}
        <span className="tag tag-accent">{tStatuses(quote.status)}</span>
      </section>

      {quote.status === "DRAFT" ? (
        <p className="text-muted text-sm">{t("notAvailable")}</p>
      ) : (
        <>
          {quote.validUntil && (
            <p className="card-meta">
              {tQuotes("validUntilLabel", { date: dateFormatter.format(quote.validUntil) })}
            </p>
          )}

          <section>
            {quote.lineItems.length === 0 ? (
              <p className="text-muted text-sm">{tQuotes("noneItems")}</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{tQuotes("description")}</th>
                      <th>{tQuotes("quantity")}</th>
                      <th>{tQuotes("unitPrice")}</th>
                      <th>{tQuotes("lineTotal")}</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col items-end gap-1" style={{ marginTop: "12px" }}>
              <p className="card-meta">{tQuotes("subtotal")}: {currencyFormatter.format(subtotal)}</p>
              <p className="card-meta">
                {vatRate === null ? tQuotes("noVat") : tQuotes("vat", { rate: vatRate })}:{" "}
                {currencyFormatter.format(vat)}
              </p>
              <p className="card-title">{tQuotes("total")}: {currencyFormatter.format(total)}</p>
            </div>
          </section>

          {quote.notes && (
            <section>
              <p className="card-meta" style={{ whiteSpace: "pre-wrap" }}>{quote.notes}</p>
            </section>
          )}

          {quote.status === "SENT" && (
            <section className="flex gap-2">
              <form action={acceptQuotePublic}>
                <input type="hidden" name="token" value={token} />
                <button type="submit" className="btn btn-primary">
                  {t("accept")}
                </button>
              </form>
              <form action={declineQuotePublic}>
                <input type="hidden" name="token" value={token} />
                <button type="submit" className="btn btn-ghost">
                  {t("decline")}
                </button>
              </form>
            </section>
          )}

          {quote.status === "ACCEPTED" && <p className="card-meta">{t("acceptedMessage")}</p>}
          {quote.status === "DECLINED" && <p className="card-meta">{t("declinedMessage")}</p>}
        </>
      )}
    </div>
  );
}
