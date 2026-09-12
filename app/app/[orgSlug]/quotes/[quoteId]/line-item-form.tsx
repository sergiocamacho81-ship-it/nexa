"use client";

import { useActionState, useRef } from "react";
import { useTranslations } from "next-intl";
import { addQuoteLineItem } from "@/app/actions/quotes";

type Product = { id: string; name: string; description: string | null; unitPrice: number };

export function LineItemForm({
  orgSlug,
  quoteId,
  products,
}: {
  orgSlug: string;
  quoteId: string;
  products: Product[];
}) {
  const t = useTranslations("Quotes");
  const [state, action, isPending] = useActionState(addQuoteLineItem, { error: null });
  const descriptionRef = useRef<HTMLInputElement>(null);
  const unitPriceRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        {products.length > 0 && (
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="productId">{t("product")}</label>
            <select
              id="productId"
              name="productId"
              className="input"
              defaultValue=""
              onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value);
                if (product) {
                  if (descriptionRef.current) descriptionRef.current.value = product.name;
                  if (unitPriceRef.current) unitPriceRef.current.value = String(product.unitPrice);
                }
              }}
            >
              <option value="">{t("customItem")}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="description">{t("description")}</label>
          <input
            id="description"
            name="description"
            type="text"
            required
            ref={descriptionRef}
            className="input"
          />
        </div>
        <div className="field">
          <label htmlFor="quantity">{t("quantity")}</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue="1"
            required
            className="input"
          />
        </div>
        <div className="field">
          <label htmlFor="unitPrice">{t("unitPrice")}</label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            required
            ref={unitPriceRef}
            className="input"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
        {isPending ? t("adding") : t("addLineItem")}
      </button>
    </form>
  );
}
