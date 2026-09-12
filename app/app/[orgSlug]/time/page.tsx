import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listTimeEntries } from "@/app/actions/time-entries";
import { listJobs } from "@/app/actions/jobs";
import { listOrganizationMembersWithEmail } from "@/app/actions/settings";
import { CreateTimeEntryForm } from "./create-time-entry-form";
import { TimeEntryRow } from "./time-entry-row";

export default async function TimePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("TimeEntries");

  const [entries, jobs, members] = await Promise.all([
    listTimeEntries(orgSlug),
    listJobs(orgSlug),
    listOrganizationMembersWithEmail(orgSlug),
  ]);
  const jobOptions = jobs.map((j) => ({ id: j.id, title: j.title }));
  const memberEmailById = new Map(members.map((m) => [m.userId, m.email]));
  const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newEntry")}</h6>
        <CreateTimeEntryForm orgSlug={orgSlug} jobs={jobOptions} members={members} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-muted" style={{ margin: 0 }}>
            {t("heading", { count: entries.length })}
          </h6>
          <span className="card-meta">{t("totalHours", { hours: totalHours })}</span>
        </div>
        {entries.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("tableDate")}</th>
                  <th>{t("tableHours")}</th>
                  <th>{t("tableJob")}</th>
                  <th>{t("tableDescription")}</th>
                  <th>{t("tableLoggedBy")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <TimeEntryRow
                    key={entry.id}
                    orgSlug={orgSlug}
                    entry={{ ...entry, hours: Number(entry.hours) }}
                    jobs={jobOptions}
                    members={members}
                    loggedByEmail={memberEmailById.get(entry.userId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
