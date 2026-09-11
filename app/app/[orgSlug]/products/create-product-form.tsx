"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createProduct } from "@/app/actions/products";

export function CreateProductForm({ orgSlug }: { orgSlug: string }) {
  const t = useTranslations("Products");
  const [state, action, isPending] = useActionState(createProduct, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="name">{t("name")}</label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="unitPrice">{t("unitPrice")}</label>
          <input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="unit">{t("unit")}</label>
          <input id="unit" name="unit" type="text" placeholder={t("unitPlaceholder")} className="input" />
        </div>
        <div className="field">
          <label htmlFor="description">{t("description")}</label>
          <input id="description" name="description" type="text" className="input" />
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
