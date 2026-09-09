import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { prisma } from "@/lib/prisma";
import { DEAL_STAGES } from "@/lib/deal-stages";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const [t, tStages, tActivity, locale] = await Promise.all([
    getTranslations("Dashboard"),
    getTranslations("DealStages"),
    getTranslations("ActivityTypes"),
    getLocale(),
  ]);

  const currency = (n: number) =>
    n.toLocaleString(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const [
    contactsCount,
    companiesCount,
    dealsByStage,
    tasksPending,
    tasksOverdue,
    recentActivities,
    campaignsCount,
  ] = await Promise.all([
    prisma.contact.count({ where: { organizationId: organization.id } }),
    prisma.company.count({ where: { organizationId: organization.id } }),
    prisma.deal.groupBy({
      by: ["stage"],
      where: { organizationId: organization.id },
      _count: { _all: true },
      _sum: { value: true },
    }),
    prisma.task.count({ where: { organizationId: organization.id, status: "PENDING" } }),
    prisma.task.count({
      where: { organizationId: organization.id, status: "PENDING", dueDate: { lt: new Date() } },
    }),
    prisma.activity.findMany({
      where: { organizationId: organization.id },
      orderBy: { occurredAt: "desc" },
      take: 5,
      include: {
        contact: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
    }),
    prisma.campaign.count({ where: { organizationId: organization.id } }),
  ]);

  const stageMap = new Map(dealsByStage.map((row) => [row.stage, row]));
  const openStages = DEAL_STAGES.filter((s) => s !== "WON" && s !== "LOST");
  const openDealsValue = openStages.reduce(
    (sum, stage) => sum + Number(stageMap.get(stage)?._sum.value ?? 0),
    0,
  );
  const openDealsCount = openStages.reduce((sum, stage) => sum + (stageMap.get(stage)?._count._all ?? 0), 0);
  const wonValue = Number(stageMap.get("WON")?._sum.value ?? 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <section className="grid grid-cols-4 gap-3">
        <div className="card elev-sm">
          <span className="card-kicker">{t("contacts")}</span>
          <p className="card-title" style={{ fontSize: "28px" }}>
            {contactsCount}
          </p>
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">{t("companies")}</span>
          <p className="card-title" style={{ fontSize: "28px" }}>
            {companiesCount}
          </p>
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">{t("openDeals")}</span>
          <p className="card-title" style={{ fontSize: "28px" }}>
            {openDealsCount}
          </p>
          <span className="card-meta">{currency(openDealsValue)}</span>
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">{t("wonTotal")}</span>
          <p className="card-title" style={{ fontSize: "28px" }}>
            {currency(wonValue)}
          </p>
        </div>
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("pipelineByStage")}</h6>
        <table className="table">
          <thead>
            <tr>
              <th>{t("stage")}</th>
              <th>{t("deals")}</th>
              <th>{t("value")}</th>
            </tr>
          </thead>
          <tbody>
            {DEAL_STAGES.map((stage) => {
              const row = stageMap.get(stage);
              return (
                <tr key={stage}>
                  <td>{tStages(stage)}</td>
                  <td className="text-muted">{row?._count._all ?? 0}</td>
                  <td className="text-muted">{currency(Number(row?._sum.value ?? 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="card elev-sm">
          <span className="card-kicker">{t("tasksPending")}</span>
          <p className="card-title" style={{ fontSize: "28px" }}>
            {tasksPending}
          </p>
          {tasksOverdue > 0 && (
            <span className="card-meta" style={{ color: "var(--color-accent-700)" }}>
              {t("tasksOverdue", { count: tasksOverdue })}
            </span>
          )}
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">{t("campaigns")}</span>
          <p className="card-title" style={{ fontSize: "28px" }}>
            {campaignsCount}
          </p>
        </div>
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("recentActivity")}</h6>
        {recentActivities.length === 0 ? (
          <p className="text-muted text-sm">{t("noActivity")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="card elev-sm">
                <div className="flex items-center justify-between">
                  <span className="tag tag-accent">{tActivity(activity.type)}</span>
                  <span className="card-meta">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(
                      activity.occurredAt,
                    )}
                  </span>
                </div>
                <p className="card-body">{activity.content}</p>
                <div className="card-meta flex-wrap">
                  {activity.contact && (
                    <span>
                      {activity.contact.firstName} {activity.contact.lastName ?? ""}
                    </span>
                  )}
                  {activity.company && <span>{activity.company.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
