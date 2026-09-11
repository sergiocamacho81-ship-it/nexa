import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { listMyOrganizations, listMyDeletedOrganizations } from "@/app/actions/organizations";
import { CreateOrganizationForm } from "./create-organization-form";
import { RestoreOrganizationButton } from "./restore-organization-button";

export default async function AppHome() {
  const [t, locale] = await Promise.all([getTranslations("Organizations"), getLocale()]);
  const [organizations, deletedOrganizations] = await Promise.all([
    listMyOrganizations(),
    listMyDeletedOrganizations(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("yourOrganizations")}</h6>
        {organizations.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="table-wrap">
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
          </div>
        )}
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("createNew")}</h6>
        <CreateOrganizationForm />
      </section>

      {deletedOrganizations.length > 0 && (
        <section>
          <h6 className="text-muted mb-3">{t("deletedHeading")}</h6>
          <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
            {t("deletedHint")}
          </p>
          <div className="flex flex-col gap-2">
            {deletedOrganizations.map((org) => (
              <div key={org.id} className="card elev-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="card-title">{org.name}</p>
                    <p className="card-meta">
                      {t("deletedOn", {
                        date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                          org.deletedAt,
                        ),
                      })}
                    </p>
                  </div>
                  <RestoreOrganizationButton organizationId={org.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
