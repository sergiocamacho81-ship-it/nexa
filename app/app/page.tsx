import Link from "next/link";
import { listMyOrganizations } from "@/app/actions/organizations";
import { CreateOrganizationForm } from "./create-organization-form";

export default async function AppHome() {
  const organizations = await listMyOrganizations();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">As tuas organizações</h6>
        {organizations.length === 0 ? (
          <p className="text-muted text-sm">Ainda não pertences a nenhuma organização.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Papel</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td>{org.name}</td>
                  <td className="text-muted">{org.slug}</td>
                  <td>
                    <span className="tag tag-accent">{org.role}</span>
                  </td>
                  <td>
                    <Link href={`/app/${org.slug}`} className="btn btn-ghost">
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h6 className="text-muted mb-3">Criar nova organização</h6>
        <CreateOrganizationForm />
      </section>
    </div>
  );
}
