import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { prisma } from "@/lib/prisma";

type AgendaItem = {
  date: Date;
  type: "task" | "job";
  id: string;
  title: string;
  statusLabel: string;
  href: string;
};

// Read-only aggregation over the two things in this app that actually carry
// a real date: pending Tasks (dueDate) and non-terminal Work Orders
// (scheduledAt). Deliberately excludes Deals (no date concept) and
// Activities (a past-tense log, not a future schedule) — see Calendar
// scoping discussion. No create/edit here; items link out to their real
// edit surface (Tasks / Work Orders) rather than duplicating those forms.
export default async function CalendarPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const [t, tJobStatuses, locale] = await Promise.all([
    getTranslations("Calendar"),
    getTranslations("JobStatuses"),
    getLocale(),
  ]);

  const [tasks, jobs] = await Promise.all([
    prisma.task.findMany({
      where: {
        organizationId: organization.id,
        deletedAt: null,
        status: "PENDING",
        dueDate: { not: null },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.job.findMany({
      where: {
        organizationId: organization.id,
        deletedAt: null,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        scheduledAt: { not: null },
      },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const items: AgendaItem[] = [
    ...tasks.map((task) => ({
      date: task.dueDate as Date,
      type: "task" as const,
      id: task.id,
      title: task.title,
      statusLabel: t("taskPending"),
      href: `/app/${orgSlug}/tasks`,
    })),
    ...jobs.map((job) => ({
      date: job.scheduledAt as Date,
      type: "job" as const,
      id: job.id,
      title: job.title,
      statusLabel: tJobStatuses(job.status),
      href: `/app/${orgSlug}/jobs`,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const groups: { dateKey: string; dateLabel: string; items: AgendaItem[] }[] = [];
  for (const item of items) {
    const dateKey = item.date.toDateString();
    let group = groups.find((g) => g.dateKey === dateKey);
    if (!group) {
      group = { dateKey, dateLabel: dateFormatter.format(item.date), items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: items.length })}</h6>
        {groups.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.dateKey} className="flex flex-col gap-2">
                <h6 className="text-muted" style={{ fontSize: "13px" }}>
                  {group.dateLabel}
                </h6>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      className="card elev-sm"
                      style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}
                    >
                      <span className="tag tag-accent">
                        {item.type === "task" ? t("task") : t("workOrder")}
                      </span>
                      <span className="flex-1 card-title" style={{ fontSize: "14px" }}>
                        {item.title}
                      </span>
                      <span className="card-meta">{item.statusLabel}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
