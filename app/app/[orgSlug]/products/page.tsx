import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listProducts } from "@/app/actions/products";
import { CreateProductForm } from "./create-product-form";
import { ProductRow } from "./product-row";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Products");

  const products = await listProducts(orgSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newProduct")}</h6>
        <CreateProductForm orgSlug={orgSlug} />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: products.length })}</h6>
        {products.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("tableName")}</th>
                  <th>{t("tablePrice")}</th>
                  <th>{t("tableUnit")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    orgSlug={orgSlug}
                    product={{ ...product, unitPrice: Number(product.unitPrice) }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
