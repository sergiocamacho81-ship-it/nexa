"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { updateProject } from "@/app/actions/projects";
import { DeleteProjectButton } from "./delete-project-button";
import { PROJECT_STATUSES } from "@/lib/project-statuses";

type Project = {
  id: string;
  title: string;
  status: (typeof PROJECT_STATUSES)[number];
  companyId: string | null;
  contactId: string | null;
  company: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string | null } | null;
  deal: { id: string; title: string } | null;
};
type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };

export function ProjectRow({
  orgSlug,
  project,
  companies,
  contacts,
}: {
  orgSlug: string;
  project: Project;
  companies: Company[];
  contacts: Contact[];
}) {
  const t = useTranslations("Projects");
  const tStatuses = useTranslations("ProjectStatuses");
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateProject, { error: null });

  if (!editing) {
    return (
      <tr>
        <td>{project.title}</td>
        <td>
          <span className="tag tag-accent">{tStatuses(project.status)}</span>
        </td>
        <td className="text-muted">{project.deal ? project.deal.title : "—"}</td>
        <td className="text-muted">{project.company ? project.company.name : "—"}</td>
        <td className="text-muted">
          {project.contact ? `${project.contact.firstName} ${project.contact.lastName ?? ""}` : "—"}
        </td>
        <td className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </button>
          <DeleteProjectButton orgSlug={orgSlug} projectId={project.id} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={6}>
        <form action={action} className="flex flex-col gap-2" style={{ padding: "8px 0" }}>
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="projectId" value={project.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor={`title-${project.id}`}>{t("title")}</label>
              <input
                id={`title-${project.id}`}
                name="title"
                type="text"
                required
                defaultValue={project.title}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`status-${project.id}`}>{t("status")}</label>
              <select
                id={`status-${project.id}`}
                name="status"
                className="input"
                defaultValue={project.status}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {tStatuses(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`companyId-${project.id}`}>{t("company")}</label>
              <select
                id={`companyId-${project.id}`}
                name="companyId"
                className="input"
                defaultValue={project.companyId ?? ""}
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
              <label htmlFor={`contactId-${project.id}`}>{t("contact")}</label>
              <select
                id={`contactId-${project.id}`}
                name="contactId"
                className="input"
                defaultValue={project.contactId ?? ""}
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
