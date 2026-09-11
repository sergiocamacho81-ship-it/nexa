"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCompany } from "@/app/actions/companies";

export function CreateCompanyForm({ orgSlug }: { orgSlug: string }) {
  const t = useTranslations("Companies");
  const [state, action, isPending] = useActionState(createCompany, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="name">{t("name")}</label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="domain">{t("domain")}</label>
          <input id="domain" name="domain" type="text" placeholder={t("domainPlaceholder")} className="input" />
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
