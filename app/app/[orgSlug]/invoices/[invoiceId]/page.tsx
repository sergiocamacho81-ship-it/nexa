import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getInvoice } from "@/app/actions/invoices";
import { listProducts } from "@/app/actions/products";
import { StatusSelect } from "./status-select";
import { LineItemForm } from "./line-item-form";
import { RemoveLineItemButton } from "./remove-line-item-button";
import { NotesForm } from "./notes-form";
import { PrintButton } from "./print-button";
import { DeleteInvoiceButton } from "./delete-invoice-button";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; invoiceId: string }>;
}) {
  const { orgSlug, invoiceId } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const [t, tStatuses, locale, invoice, products] = await Promise.all([
    getTranslations("Invoices"),
    getTranslations("InvoiceStatuses"),
    getLocale(),
    getInvoice(orgSlug, invoiceId),
    listProducts(orgSlug),
  ]);

  if (!invoice) {
    notFound();
  }

  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  // Subtotal/VAT/total are server-computed and persisted (see
  // recalculateInvoiceTotals in app/actions/invoices.ts) — read directly,
  // never re-derived from line items here.
  const subtotal = Number(invoice.subtotal);
  const vat = Number(invoice.vatAmount);
  const total = Number(invoice.total);
  const vatRate = invoice.vatRate === null ? null : Number(invoice.vatRate);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="invoice-print-hide">
        <Link href={`/app/${orgSlug}/invoices`} className="text-muted text-sm">
          ← {t("backToInvoices")}
        </Link>
      </div>

      <div className="invoice-print-area flex flex-col gap-6">
        <section className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h6 className="text-muted" style={{ margin: 0 }}>
              {t("invoiceNumber", { number: invoice.number })}
            </h6>
            <p className="card-meta">{dateFormatter.format(invoice.issueDate)}</p>
            <span className="tag tag-accent">{tStatuses(invoice.status)}</span>
          </div>
          <div className="invoice-print-hide flex items-center gap-2">
            <StatusSelect orgSlug={orgSlug} invoiceId={invoice.id} currentStatus={invoice.status} />
            <PrintButton />
          </div>
        </section>

        {invoice.job && (
          <section>
            <p className="card-meta">
              {t("job")}: <Link href={`/app/${orgSlug}/jobs`}>{invoice.job.title}</Link>
            </p>
            {invoice.job.contact && (
              <p className="card-meta">
                {t("contact")}: {invoice.job.contact.firstName} {invoice.job.contact.lastName ?? ""}
              </p>
            )}
            {invoice.job.company && <p className="card-meta">{invoice.job.company.name}</p>}
          </section>
        )}

        <section>
          <h6 className="text-muted mb-3">{t("lineItemsHeading")}</h6>
          {invoice.lineItems.length === 0 ? (
            <p className="text-muted text-sm">{t("none_items")}</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("description")}</th>
                    <th>{t("quantity")}</th>
                    <th>{t("unitPrice")}</th>
                    <th>{t("lineTotal")}</th>
                    <th className="invoice-print-hide"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td className="text-muted">{Number(item.quantity)}</td>
                      <td className="text-muted">{currencyFormatter.format(Number(item.unitPrice))}</td>
                      <td className="text-muted">
                        {currencyFormatter.format(Number(item.quantity) * Number(item.unitPrice))}
                      </td>
                      <td className="invoice-print-hide">
                        <RemoveLineItemButton orgSlug={orgSlug} invoiceId={invoice.id} lineItemId={item.id} />
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

        {invoice.notes && (
          <section>
            <p className="card-meta" style={{ whiteSpace: "pre-wrap" }}>{invoice.notes}</p>
          </section>
        )}
      </div>

      <section className="invoice-print-hide">
        <h6 className="text-muted mb-3">{t("addLineItem")}</h6>
        <LineItemForm
          orgSlug={orgSlug}
          invoiceId={invoice.id}
          products={products.map((p) => ({ ...p, unitPrice: Number(p.unitPrice) }))}
        />
      </section>

      <section className="invoice-print-hide">
        <h6 className="text-muted mb-3">{t("notes")}</h6>
        <NotesForm orgSlug={orgSlug} invoiceId={invoice.id} notes={invoice.notes} />
      </section>

      <section className="invoice-print-hide">
        <DeleteInvoiceButton orgSlug={orgSlug} invoiceId={invoice.id} />
      </section>
    </div>
  );
}
