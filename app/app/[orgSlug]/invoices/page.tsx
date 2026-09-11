import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listInvoices } from "@/app/actions/invoices";

function invoiceTotal(lineItems: { quantity: unknown; unitPrice: unknown }[], vatRate: unknown) {
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
  const vat = vatRate === null ? 0 : subtotal * (Number(vatRate) / 100);
  return subtotal + vat;
}

export default async function InvoicesPage({
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
    getTranslations("Invoices"),
    getTranslations("InvoiceStatuses"),
    getLocale(),
  ]);

  const invoices = await listInvoices(orgSlug);
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: invoices.length })}</h6>
        {invoices.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("tableNumber")}</th>
                  <th>{t("tableJob")}</th>
                  <th>{t("tableStatus")}</th>
                  <th>{t("tableTotal")}</th>
                  <th>{t("tableDate")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <Link href={`/app/${orgSlug}/invoices/${invoice.id}`}>
                        {t("invoiceNumber", { number: invoice.number })}
                      </Link>
                    </td>
                    <td className="text-muted">
                      {invoice.deal
                        ? invoice.deal.title
                        : "—"}
                    </td>
                    <td>
                      <span className="tag tag-accent">{tStatuses(invoice.status)}</span>
                    </td>
                    <td className="text-muted">
                      {currencyFormatter.format(invoiceTotal(invoice.lineItems, invoice.vatRate))}
                    </td>
                    <td className="text-muted">{dateFormatter.format(invoice.issueDate)}</td>
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
