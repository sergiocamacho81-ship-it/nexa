"use client";

import { useActionState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createMaterialUsage } from "@/app/actions/material-usages";

type Product = { id: string; name: string; unit: string | null; unitPrice: number };
type Job = { id: string; title: string };

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateMaterialUsageForm({
  orgSlug,
  products,
  jobs,
}: {
  orgSlug: string;
  products: Product[];
  jobs: Job[];
}) {
  const t = useTranslations("Materials");
  const [state, action, isPending] = useActionState(createMaterialUsage, { error: null });
  const descriptionRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);
  const unitCostRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="date">{t("date")}</label>
          <input id="date" name="date" type="date" required defaultValue={todayInputValue()} className="input" />
        </div>
        <div className="field">
          <label htmlFor="jobId">{t("job")}</label>
          <select id="jobId" name="jobId" className="input" defaultValue="">
            <option value="">{t("noJob")}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
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
                  if (unitRef.current) unitRef.current.value = product.unit ?? "";
                  if (unitCostRef.current) unitCostRef.current.value = String(product.unitPrice);
                }
              }}
            >
              <option value="">{t("customMaterial")}</option>
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
          <input id="quantity" name="quantity" type="number" step="0.01" min="0.01" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="unit">{t("unit")}</label>
          <input
            id="unit"
            name="unit"
            type="text"
            ref={unitRef}
            placeholder={t("unitPlaceholder")}
            className="input"
          />
        </div>
        <div className="field">
          <label htmlFor="unitCost">{t("unitCost")}</label>
          <input
            id="unitCost"
            name="unitCost"
            type="number"
            step="0.01"
            min="0"
            ref={unitCostRef}
            className="input"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        {isPending ? t("adding") : t("add")}
      </button>
    </form>
  );
}
