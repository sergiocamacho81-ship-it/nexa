import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listQuotes } from "@/app/actions/quotes";

export default async function QuotesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const [t, tStatuses, locale] = await Promise.all([
    getTranslations("Quotes"),
    getTranslations("QuoteStatuses"),
    getLocale(),
  ]);

  const quotes = await listQuotes(orgSlug);
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: quotes.length })}</h6>
        {quotes.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("tableNumber")}</th>
                  <th>{t("tableCustomer")}</th>
                  <th>{t("tableStatus")}</th>
                  <th>{t("tableTotal")}</th>
                  <th>{t("tableDate")}</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <Link href={`/app/${orgSlug}/quotes/${quote.id}`}>
                        {t("quoteNumber", { number: quote.number })}
                      </Link>
                    </td>
                    <td className="text-muted">
                      {quote.company
                        ? quote.company.name
                        : quote.contact
                          ? `${quote.contact.firstName} ${quote.contact.lastName ?? ""}`.trim()
                          : "—"}
                    </td>
                    <td>
                      <span className="tag tag-accent">{tStatuses(quote.status)}</span>
                    </td>
                    <td className="text-muted">{currencyFormatter.format(Number(quote.total))}</td>
                    <td className="text-muted">{dateFormatter.format(quote.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
