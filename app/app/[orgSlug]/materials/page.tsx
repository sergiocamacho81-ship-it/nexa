import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listMaterialUsages } from "@/app/actions/material-usages";
import { listProducts } from "@/app/actions/products";
import { listJobs } from "@/app/actions/jobs";
import { CreateMaterialUsageForm } from "./create-material-usage-form";
import { MaterialUsageRow } from "./material-usage-row";

export default async function MaterialsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const [t, locale] = await Promise.all([getTranslations("Materials"), getLocale()]);

  const [entries, products, jobs] = await Promise.all([
    listMaterialUsages(orgSlug),
    listProducts(orgSlug),
    listJobs(orgSlug),
  ]);
  const jobOptions = jobs.map((j) => ({ id: j.id, title: j.title }));
  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    unitPrice: Number(p.unitPrice),
  }));
  const entriesForDisplay = entries.map((entry) => ({
    ...entry,
    quantity: Number(entry.quantity),
    unitCost: entry.unitCost === null ? null : Number(entry.unitCost),
  }));
  const totalCost = entriesForDisplay.reduce(
    (sum, entry) => sum + (entry.unitCost !== null ? entry.unitCost * entry.quantity : 0),
    0,
  );
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newEntry")}</h6>
        <CreateMaterialUsageForm orgSlug={orgSlug} products={productOptions} jobs={jobOptions} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-muted" style={{ margin: 0 }}>
            {t("heading", { count: entries.length })}
          </h6>
          <span className="card-meta">{t("totalCost", { cost: currencyFormatter.format(totalCost) })}</span>
        </div>
        {entriesForDisplay.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("tableDate")}</th>
                  <th>{t("tableDescription")}</th>
                  <th>{t("tableQuantity")}</th>
                  <th>{t("tableCost")}</th>
                  <th>{t("tableJob")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entriesForDisplay.map((entry) => (
                  <MaterialUsageRow key={entry.id} orgSlug={orgSlug} entry={entry} jobs={jobOptions} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
