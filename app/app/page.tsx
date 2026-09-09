import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listMyOrganizations } from "@/app/actions/organizations";
import { CreateOrganizationForm } from "./create-organization-form";

export default async function AppHome() {
  const t = await getTranslations("Organizations");
  const organizations = await listMyOrganizations();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("yourOrganizations")}</h6>
        {organizations.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("slug")}</th>
                <th>{t("role")}</th>
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
                      {t("open")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("createNew")}</h6>
        <CreateOrganizationForm />
      </section>
    </div>
  );
}
