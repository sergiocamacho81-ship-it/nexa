import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrganizationSettings } from "@/app/actions/settings";
import { UpdateOrgNameForm } from "./update-org-name-form";
import { AddMemberForm } from "./add-member-form";
import { MemberRoleSelect } from "./member-role-select";
import { RemoveMemberButton } from "./remove-member-button";
import { SmtpSettingsForm } from "./smtp-settings-form";
import { DeleteOrganizationButton } from "./delete-organization-button";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const settings = await getOrganizationSettings(orgSlug);
  if (!settings) {
    notFound();
  }

  const [t, tRoles] = await Promise.all([
    getTranslations("Settings"),
    getTranslations("MembershipRoles"),
  ]);
  const { organization, members, currentUserRole } = settings;
  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("organizationHeading")}</h6>
        <UpdateOrgNameForm orgSlug={orgSlug} currentName={organization.name} disabled={!canManage} />
        <p className="text-muted" style={{ fontSize: "11px", marginTop: "6px" }}>
          {t("slugNote", { slug: organization.slug })}
        </p>
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("smtpHeading")}</h6>
        <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
          {t("smtpHint")}
        </p>
        <SmtpSettingsForm orgSlug={orgSlug} organization={organization} disabled={!canManage} />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("membersHeading", { count: members.length })}</h6>
        <table className="table">
          <thead>
            <tr>
              <th>{t("tableEmail")}</th>
              <th>{t("tableRole")}</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  {member.email} {member.isCurrentUser && <span className="text-muted">{t("you")}</span>}
                </td>
                <td>
                  {canManage ? (
                    <MemberRoleSelect orgSlug={orgSlug} membershipId={member.id} currentRole={member.role} />
                  ) : (
                    <span className="tag tag-accent">{tRoles(member.role)}</span>
                  )}
                </td>
                {canManage && (
                  <td>
                    <RemoveMemberButton orgSlug={orgSlug} membershipId={member.id} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {canManage && (
        <section>
          <h6 className="text-muted mb-3">{t("addMemberHeading")}</h6>
          <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
            {t("addMemberHint")}
          </p>
          <AddMemberForm orgSlug={orgSlug} />
        </section>
      )}

      {currentUserRole === "OWNER" && (
        <section>
          <h6 className="text-muted mb-3">{t("dangerZoneHeading")}</h6>
          <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
            {t("deleteOrgHint")}
          </p>
          <DeleteOrganizationButton organizationId={organization.id} organizationName={organization.name} />
        </section>
      )}
    </div>
  );
}
