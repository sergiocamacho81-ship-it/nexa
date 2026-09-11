"use client";

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { updateProduct } from "@/app/actions/products";
import { DeleteProductButton } from "./delete-product-button";

type Product = {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
  unitPrice: number;
};

export function ProductRow({ orgSlug, product }: { orgSlug: string; product: Product }) {
  const t = useTranslations("Products");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateProduct, { error: null });

  if (!editing) {
    return (
      <tr>
        <td>{product.name}</td>
        <td className="text-muted">
          {product.unitPrice.toLocaleString(locale, { style: "currency", currency: "CHF" })}
        </td>
        <td className="text-muted">{product.unit ?? "—"}</td>
        <td className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </button>
          <DeleteProductButton orgSlug={orgSlug} productId={product.id} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={4}>
        <form action={action} className="flex flex-col gap-2" style={{ padding: "8px 0" }}>
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="productId" value={product.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field">
              <label htmlFor={`name-${product.id}`}>{t("name")}</label>
              <input
                id={`name-${product.id}`}
                name="name"
                type="text"
                required
                defaultValue={product.name}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`unitPrice-${product.id}`}>{t("unitPrice")}</label>
              <input
                id={`unitPrice-${product.id}`}
                name="unitPrice"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={product.unitPrice}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`unit-${product.id}`}>{t("unit")}</label>
              <input
                id={`unit-${product.id}`}
                name="unit"
                type="text"
                placeholder={t("unitPlaceholder")}
                defaultValue={product.unit ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`description-${product.id}`}>{t("description")}</label>
              <input
                id={`description-${product.id}`}
                name="description"
                type="text"
                defaultValue={product.description ?? ""}
                className="input"
              />
            </div>
          </div>

          {state.error && (
            <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
              {state.error}
            </p>
          )}

          <div className="flex gap-2" style={{ alignSelf: "flex-start" }}>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? t("saving") : t("save")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t("cancel")}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
