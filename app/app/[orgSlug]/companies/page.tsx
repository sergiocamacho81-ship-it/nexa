import { notFound } from "next/navigation";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { CreateCompanyForm } from "./create-company-form";
import { DeleteCompanyButton } from "./delete-company-button";

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

  const companies = await listCompanies(orgSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">Nova empresa</h6>
        <CreateCompanyForm orgSlug={orgSlug} />
      </section>

      <section>
        <h6 className="text-muted mb-3">Empresas ({companies.length})</h6>
        {companies.length === 0 ? (
          <p className="text-muted text-sm">Ainda não há empresas nesta organização.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Domínio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td className="text-muted">{company.domain ?? "—"}</td>
                  <td>
                    <DeleteCompanyButton orgSlug={orgSlug} companyId={company.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
