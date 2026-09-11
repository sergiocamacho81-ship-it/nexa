"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createActivity } from "@/app/actions/activities";
import { ACTIVITY_TYPES } from "@/lib/activity-types";

type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };
type Deal = { id: string; title: string };

export function CreateActivityForm({
  orgSlug,
  contacts,
  companies,
  deals,
}: {
  orgSlug: string;
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
}) {
  const t = useTranslations("Activities");
  const tTypes = useTranslations("ActivityTypes");
  const [state, action, isPending] = useActionState(createActivity, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="type">{t("type")}</label>
          <select id="type" name="type" className="input" defaultValue="NOTE">
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {tTypes(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="contactId">{t("contact")}</label>
          <select id="contactId" name="contactId" className="input" defaultValue="">
            <option value="">{t("noContact")}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName ?? ""}
              </option>
            ))}
          </select>
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
        <div className="field">
          <label htmlFor="dealId">{t("deal")}</label>
          <select id="dealId" name="dealId" className="input" defaultValue="">
            <option value="">{t("noDeal")}</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="content">{t("description")}</label>
        <textarea id="content" name="content" required className="input" rows={3} />
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
        {isPending ? t("registering") : t("register")}
      </button>
    </form>
  );
}
