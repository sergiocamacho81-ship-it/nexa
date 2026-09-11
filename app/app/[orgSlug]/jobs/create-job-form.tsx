"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createJob } from "@/app/actions/jobs";
import { JOB_STATUSES } from "@/lib/job-statuses";

type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };
type Deal = { id: string; title: string };

export function CreateJobForm({
  orgSlug,
  companies,
  contacts,
  deals,
}: {
  orgSlug: string;
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
}) {
  const t = useTranslations("Jobs");
  const tStatuses = useTranslations("JobStatuses");
  const [state, action, isPending] = useActionState(createJob, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="title">{t("title")}</label>
          <input id="title" name="title" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="status">{t("status")}</label>
          <select id="status" name="status" className="input" defaultValue="SCHEDULED">
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {tStatuses(status)}
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
