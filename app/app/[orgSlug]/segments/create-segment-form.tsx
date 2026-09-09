"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createSegment } from "@/app/actions/segments";

type Company = { id: string; name: string };

export function CreateSegmentForm({ orgSlug, companies }: { orgSlug: string; companies: Company[] }) {
  const t = useTranslations("Segments");
  const [state, action, isPending] = useActionState(createSegment, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="name">{t("name")}</label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="description">{t("description")}</label>
          <input id="description" name="description" type="text" className="input" />
        </div>
        <div className="field">
          <label htmlFor="companyId">{t("company")}</label>
          <select id="companyId" name="companyId" className="input" defaultValue="">
            <option value="">{t("anyCompany")}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hasEmail">{t("email")}</label>
          <select id="hasEmail" name="hasEmail" className="input" defaultValue="">
            <option value="">{t("anyEmail")}</option>
            <option value="true">{t("hasEmail")}</option>
            <option value="false">{t("noEmail")}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="createdAfter">{t("createdAfter")}</label>
          <input id="createdAfter" name="createdAfter" type="date" className="input" />
        </div>
        <div className="field">
          <label htmlFor="createdBefore">{t("createdBefore")}</label>
          <input id="createdBefore" name="createdBefore" type="date" className="input" />
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
        {isPending ? t("creating") : t("create")}
      </button>
    </form>
  );
}
