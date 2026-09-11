import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listJobs } from "@/app/actions/jobs";
import { listCompanies } from "@/app/actions/companies";
import { listDeals } from "@/app/actions/deals";
import { prisma } from "@/lib/prisma";
import { CreateJobForm } from "./create-job-form";
import { JobRow } from "./job-row";

export default async function JobsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Jobs");

  const [jobs, companies, deals, contacts] = await Promise.all([
    listJobs(orgSlug),
    listCompanies(orgSlug),
    listDeals(orgSlug),
    prisma.contact.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newJob")}</h6>
        <CreateJobForm
          orgSlug={orgSlug}
          companies={companies}
          contacts={contacts}
          deals={deals.map((d) => ({ id: d.id, title: d.title }))}
        />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: jobs.length })}</h6>
        {jobs.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("tableTitle")}</th>
                  <th>{t("tableStatus")}</th>
                  <th>{t("tableDeal")}</th>
                  <th>{t("tableCompany")}</th>
                  <th>{t("tableContact")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <JobRow key={job.id} orgSlug={orgSlug} job={job} companies={companies} contacts={contacts} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
