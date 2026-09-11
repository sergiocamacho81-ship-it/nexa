"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { updateJob } from "@/app/actions/jobs";
import { DeleteJobButton } from "./delete-job-button";
import { JOB_STATUSES } from "@/lib/job-statuses";

type Job = {
  id: string;
  title: string;
  status: (typeof JOB_STATUSES)[number];
  companyId: string | null;
  contactId: string | null;
  company: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string | null } | null;
  deal: { id: string; title: string } | null;
};
type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };

export function JobRow({
  orgSlug,
  job,
  companies,
  contacts,
}: {
  orgSlug: string;
  job: Job;
  companies: Company[];
  contacts: Contact[];
}) {
  const t = useTranslations("Jobs");
  const tStatuses = useTranslations("JobStatuses");
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateJob, { error: null });

  if (!editing) {
    return (
      <tr>
        <td>{job.title}</td>
        <td>
          <span className="tag tag-accent">{tStatuses(job.status)}</span>
        </td>
        <td className="text-muted">{job.deal ? job.deal.title : "—"}</td>
        <td className="text-muted">{job.company ? job.company.name : "—"}</td>
        <td className="text-muted">
          {job.contact ? `${job.contact.firstName} ${job.contact.lastName ?? ""}` : "—"}
        </td>
        <td className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </button>
          <DeleteJobButton orgSlug={orgSlug} jobId={job.id} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={6}>
        <form action={action} className="flex flex-col gap-2" style={{ padding: "8px 0" }}>
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="jobId" value={job.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor={`title-${job.id}`}>{t("title")}</label>
              <input
                id={`title-${job.id}`}
                name="title"
                type="text"
                required
                defaultValue={job.title}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`status-${job.id}`}>{t("status")}</label>
              <select id={`status-${job.id}`} name="status" className="input" defaultValue={job.status}>
                {JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {tStatuses(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`companyId-${job.id}`}>{t("company")}</label>
              <select
                id={`companyId-${job.id}`}
                name="companyId"
                className="input"
                defaultValue={job.companyId ?? ""}
              >
                <option value="">{t("noCompany")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`contactId-${job.id}`}>{t("contact")}</label>
              <select
                id={`contactId-${job.id}`}
                name="contactId"
                className="input"
                defaultValue={job.contactId ?? ""}
              >
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
