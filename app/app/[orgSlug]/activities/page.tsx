import { notFound } from "next/navigation";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { listActivities } from "@/app/actions/activities";
import { ACTIVITY_TYPE_LABELS } from "@/lib/activity-types";
import { prisma } from "@/lib/prisma";
import { CreateActivityForm } from "./create-activity-form";
import { DeleteActivityButton } from "./delete-activity-button";

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const [activities, companies, deals, contacts] = await Promise.all([
    listActivities(orgSlug),
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
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">Nova atividade</h6>
        <CreateActivityForm
          orgSlug={orgSlug}
          contacts={contacts}
          companies={companies}
          deals={deals}
        />
      </section>

      <section>
        <h6 className="text-muted mb-3">Histórico ({activities.length})</h6>
        {activities.length === 0 ? (
          <p className="text-muted text-sm">Ainda não há atividades registadas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activities.map((activity) => (
              <div key={activity.id} className="card elev-sm">
                <div className="flex items-center justify-between">
                  <span className="tag tag-accent">{ACTIVITY_TYPE_LABELS[activity.type]}</span>
                  <span className="card-meta">
                    {new Intl.DateTimeFormat("pt-PT", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(activity.occurredAt)}
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
                  {activity.deal && <span>{activity.deal.title}</span>}
                  <DeleteActivityButton orgSlug={orgSlug} activityId={activity.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
