"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { updateTimeEntry } from "@/app/actions/time-entries";
import { DeleteTimeEntryButton } from "./delete-time-entry-button";

type TimeEntry = {
  id: string;
  date: Date;
  hours: number;
  description: string | null;
  jobId: string | null;
  userId: string;
  job: { id: string; title: string } | null;
};
type Job = { id: string; title: string };
type Member = { userId: string; email: string };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function TimeEntryRow({
  orgSlug,
  entry,
  jobs,
  members,
  loggedByEmail,
}: {
  orgSlug: string;
  entry: TimeEntry;
  jobs: Job[];
  members: Member[];
  loggedByEmail?: string;
}) {
  const t = useTranslations("TimeEntries");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateTimeEntry, { error: null });

  if (!editing) {
    return (
      <tr>
        <td className="text-muted">{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(entry.date)}</td>
        <td>{entry.hours}</td>
        <td className="text-muted">{entry.job ? entry.job.title : "—"}</td>
        <td className="text-muted">{entry.description || "—"}</td>
        <td className="text-muted">{loggedByEmail ?? "—"}</td>
        <td className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </button>
          <DeleteTimeEntryButton orgSlug={orgSlug} timeEntryId={entry.id} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={6}>
        <form action={action} className="flex flex-col gap-2" style={{ padding: "8px 0" }}>
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="timeEntryId" value={entry.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field">
              <label htmlFor={`date-${entry.id}`}>{t("date")}</label>
              <input
                id={`date-${entry.id}`}
                name="date"
                type="date"
                required
                defaultValue={toDateInputValue(entry.date)}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`hours-${entry.id}`}>{t("hours")}</label>
              <input
                id={`hours-${entry.id}`}
                name="hours"
                type="number"
                step="0.25"
                min="0.25"
                required
                defaultValue={entry.hours}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`jobId-${entry.id}`}>{t("job")}</label>
              <select
                id={`jobId-${entry.id}`}
                name="jobId"
                className="input"
                defaultValue={entry.jobId ?? ""}
              >
                <option value="">{t("noJob")}</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`userId-${entry.id}`}>{t("loggedBy")}</label>
              <select
                id={`userId-${entry.id}`}
                name="userId"
                className="input"
                defaultValue={entry.userId}
              >
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor={`description-${entry.id}`}>{t("description")}</label>
              <input
                id={`description-${entry.id}`}
                name="description"
                type="text"
                defaultValue={entry.description ?? ""}
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
