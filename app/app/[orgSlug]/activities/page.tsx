import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { listActivities } from "@/app/actions/activities";
import { prisma } from "@/lib/prisma";
import { CreateActivityForm } from "./create-activity-form";
import { ActivityRow } from "./activity-row";

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
  const t = await getTranslations("Activities");

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
        <h6 className="text-muted mb-3">{t("newActivity")}</h6>
        <CreateActivityForm
          orgSlug={orgSlug}
          contacts={contacts}
          companies={companies}
          deals={deals}
        />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: activities.length })}</h6>
        {activities.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activities.map((activity) => (
              <ActivityRow
                key={activity.id}
                orgSlug={orgSlug}
                activity={activity}
                companies={companies}
                contacts={contacts}
                deals={deals}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
