import type { Prisma } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { TaskCheckbox } from "./task-checkbox";
import { DeleteTaskButton } from "./delete-task-button";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    contact: { select: { id: true; firstName: true; lastName: true } };
    company: { select: { id: true; name: true } };
    deal: { select: { id: true; title: true } };
  };
}>;

export async function TaskRow({
  task,
  orgSlug,
  assigneeEmail,
}: {
  task: TaskWithRelations;
  orgSlug: string;
  assigneeEmail?: string;
}) {
  const isCompleted = task.status === "COMPLETED";
  const [t, locale] = await Promise.all([getTranslations("Tasks"), getLocale()]);

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
      <DeleteTaskButton orgSlug={orgSlug} taskId={task.id} />
    </div>
  );
}
