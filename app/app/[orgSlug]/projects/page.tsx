import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listProjects } from "@/app/actions/projects";
import { listCompanies } from "@/app/actions/companies";
import { listDeals } from "@/app/actions/deals";
import { prisma } from "@/lib/prisma";
import { CreateProjectForm } from "./create-project-form";
import { ProjectRow } from "./project-row";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Projects");

  const [projects, companies, deals, contacts] = await Promise.all([
    listProjects(orgSlug),
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
        <h6 className="text-muted mb-3">{t("newProject")}</h6>
        <CreateProjectForm
          orgSlug={orgSlug}
          companies={companies}
          contacts={contacts}
          deals={deals.map((d) => ({ id: d.id, title: d.title }))}
        />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: projects.length })}</h6>
        {projects.length === 0 ? (
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
                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    orgSlug={orgSlug}
                    project={project}
                    companies={companies}
                    contacts={contacts}
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
