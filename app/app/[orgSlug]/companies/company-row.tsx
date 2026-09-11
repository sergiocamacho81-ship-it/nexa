"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { updateCompany } from "@/app/actions/companies";
import { DeleteCompanyButton } from "./delete-company-button";

type Company = { id: string; name: string; domain: string | null };

export function CompanyRow({ orgSlug, company }: { orgSlug: string; company: Company }) {
  const t = useTranslations("Companies");
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateCompany, { error: null });

  if (!editing) {
    return (
      <tr>
        <td>{company.name}</td>
        <td className="text-muted">{company.domain ?? "—"}</td>
        <td className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </button>
          <DeleteCompanyButton orgSlug={orgSlug} companyId={company.id} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={3}>
        <form action={action} className="flex flex-col gap-2" style={{ padding: "8px 0" }}>
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="companyId" value={company.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field">
              <label htmlFor={`name-${company.id}`}>{t("name")}</label>
              <input
                id={`name-${company.id}`}
                name="name"
                type="text"
                required
                defaultValue={company.name}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`domain-${company.id}`}>{t("domain")}</label>
              <input
                id={`domain-${company.id}`}
                name="domain"
                type="text"
                defaultValue={company.domain ?? ""}
                placeholder={t("domainPlaceholder")}
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
