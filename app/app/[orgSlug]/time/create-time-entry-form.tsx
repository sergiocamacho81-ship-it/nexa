"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createTimeEntry } from "@/app/actions/time-entries";

type Job = { id: string; title: string };
type Member = { userId: string; email: string };

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateTimeEntryForm({
  orgSlug,
  jobs,
  members,
}: {
  orgSlug: string;
  jobs: Job[];
  members: Member[];
}) {
  const t = useTranslations("TimeEntries");
  const [state, action, isPending] = useActionState(createTimeEntry, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="date">{t("date")}</label>
          <input id="date" name="date" type="date" required defaultValue={todayInputValue()} className="input" />
        </div>
        <div className="field">
          <label htmlFor="hours">{t("hours")}</label>
          <input id="hours" name="hours" type="number" step="0.25" min="0.25" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="jobId">{t("job")}</label>
          <select id="jobId" name="jobId" className="input" defaultValue="">
            <option value="">{t("noJob")}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="userId">{t("loggedBy")}</label>
          <select id="userId" name="userId" className="input" defaultValue="">
            <option value="">{t("me")}</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.email}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
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
