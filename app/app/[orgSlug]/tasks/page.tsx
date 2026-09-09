import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { listTasks } from "@/app/actions/tasks";
import { listOrganizationMembersWithEmail } from "@/app/actions/settings";
import { prisma } from "@/lib/prisma";
import { CreateTaskForm } from "./create-task-form";
import { TaskRow } from "./task-row";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Tasks");

  const [tasks, companies, deals, contacts, members] = await Promise.all([
    listTasks(orgSlug),
    listCompanies(orgSlug),
    prisma.deal.findMany({
      where: { organizationId: organization.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.contact.findMany({
      where: { organizationId: organization.id },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    listOrganizationMembersWithEmail(orgSlug),
  ]);
  const memberEmailById = new Map(members.map((m) => [m.userId, m.email]));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newTask")}</h6>
        <CreateTaskForm
          orgSlug={orgSlug}
          contacts={contacts}
          companies={companies}
          deals={deals}
          members={members}
        />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: tasks.length })}</h6>
        {tasks.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                orgSlug={orgSlug}
                assigneeEmail={task.assigneeId ? memberEmailById.get(task.assigneeId) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
