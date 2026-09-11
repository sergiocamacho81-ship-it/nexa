import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { CreateCompanyForm } from "./create-company-form";
import { CompanyRow } from "./company-row";

export default async function CompaniesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Companies");

  const companies = await listCompanies(orgSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newCompany")}</h6>
        <CreateCompanyForm orgSlug={orgSlug} />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: companies.length })}</h6>
        {companies.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("tableName")}</th>
                <th>{t("tableDomain")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <CompanyRow key={company.id} orgSlug={orgSlug} company={company} />
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </div>
  );
}
