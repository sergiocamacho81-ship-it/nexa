"use client";

import { useActionState, useState } from "react";
import type { Prisma } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { TaskCheckbox } from "./task-checkbox";
import { DeleteTaskButton } from "./delete-task-button";
import { updateTask } from "@/app/actions/tasks";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    contact: { select: { id: true; firstName: true; lastName: true } };
    company: { select: { id: true; name: true } };
    deal: { select: { id: true; title: true } };
  };
}>;
type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };
type Deal = { id: string; title: string };
type Member = { userId: string; email: string };

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function TaskRow({
  task,
  orgSlug,
  assigneeEmail,
  companies,
  contacts,
  deals,
  members,
}: {
  task: TaskWithRelations;
  orgSlug: string;
  assigneeEmail?: string;
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  members: Member[];
}) {
  const isCompleted = task.status === "COMPLETED";
  const t = useTranslations("Tasks");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateTask, { error: null });

  if (editing) {
    return (
      <div className="card elev-sm">
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="taskId" value={task.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor={`title-${task.id}`}>{t("title")}</label>
              <input
                id={`title-${task.id}`}
                name="title"
                type="text"
                required
                defaultValue={task.title}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`dueDate-${task.id}`}>{t("dueDate")}</label>
              <input
                id={`dueDate-${task.id}`}
                name="dueDate"
                type="date"
                defaultValue={toDateInputValue(task.dueDate)}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`assigneeId-${task.id}`}>{t("assignee")}</label>
              <select
                id={`assigneeId-${task.id}`}
                name="assigneeId"
                className="input"
                defaultValue={task.assigneeId ?? ""}
              >
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`contactId-${task.id}`}>{t("contact")}</label>
              <select
                id={`contactId-${task.id}`}
                name="contactId"
                className="input"
                defaultValue={task.contactId ?? ""}
              >
                <option value="">{t("noContact")}</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName ?? ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`companyId-${task.id}`}>{t("company")}</label>
              <select
                id={`companyId-${task.id}`}
                name="companyId"
                className="input"
                defaultValue={task.companyId ?? ""}
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
              <label htmlFor={`dealId-${task.id}`}>{t("deal")}</label>
              <select
                id={`dealId-${task.id}`}
                name="dealId"
                className="input"
                defaultValue={task.dealId ?? ""}
              >
                <option value="">{t("noDeal")}</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
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
      </div>
    );
  }

  return (
    <div className="card elev-sm" style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}>
      <TaskCheckbox orgSlug={orgSlug} taskId={task.id} isCompleted={isCompleted} />
      <div className="flex-1">
        <p
          className="card-title"
          style={isCompleted ? { textDecoration: "line-through", opacity: 0.5 } : undefined}
        >
          {task.title}
        </p>
        <div className="card-meta flex-wrap">
          {task.dueDate && (
            <span>{new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(task.dueDate)}</span>
          )}
          {task.contact && (
            <span>
              {task.contact.firstName} {task.contact.lastName ?? ""}
            </span>
          )}
          {task.company && <span>{task.company.name}</span>}
          {task.deal && <span>{task.deal.title}</span>}
          {assigneeEmail && <span>{t("assigneeLabel", { email: assigneeEmail })}</span>}
        </div>
      </div>
      <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
        {t("edit")}
      </button>
      <DeleteTaskButton orgSlug={orgSlug} taskId={task.id} />
    </div>
  );
}
