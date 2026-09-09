"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createContact } from "@/app/actions/contacts";

type Company = { id: string; name: string };

export function CreateContactForm({
  orgSlug,
  companies,
}: {
  orgSlug: string;
  companies: Company[];
}) {
  const t = useTranslations("Contacts");
  const [state, action, isPending] = useActionState(createContact, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="firstName">{t("firstName")}</label>
          <input id="firstName" name="firstName" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="lastName">{t("lastName")}</label>
          <input id="lastName" name="lastName" type="text" className="input" />
        </div>
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" className="input" />
        </div>
        <div className="field">
          <label htmlFor="phone">{t("phone")}</label>
          <input id="phone" name="phone" type="tel" className="input" />
        </div>
        <div className="field">
          <label htmlFor="companyId">{t("company")}</label>
          <select id="companyId" name="companyId" className="input" defaultValue="">
            <option value="">{t("noCompany")}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
        {isPending ? t("adding") : t("add")}
      </button>
    </form>
  );
}
