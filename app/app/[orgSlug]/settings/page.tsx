import { notFound } from "next/navigation";
import { getOrganizationSettings } from "@/app/actions/settings";
import { MEMBERSHIP_ROLE_LABELS } from "@/lib/membership-roles";
import { UpdateOrgNameForm } from "./update-org-name-form";
import { AddMemberForm } from "./add-member-form";
import { MemberRoleSelect } from "./member-role-select";
import { RemoveMemberButton } from "./remove-member-button";

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

  const { organization, members, currentUserRole } = settings;
  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">Organização</h6>
        <UpdateOrgNameForm orgSlug={orgSlug} currentName={organization.name} disabled={!canManage} />
        <p className="text-muted" style={{ fontSize: "11px", marginTop: "6px" }}>
          Slug: {organization.slug} (fixo, usado nos URLs)
        </p>
      </section>

      <section>
        <h6 className="text-muted mb-3">Membros ({members.length})</h6>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Papel</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  {member.email} {member.isCurrentUser && <span className="text-muted">(tu)</span>}
                </td>
                <td>
                  {canManage ? (
                    <MemberRoleSelect orgSlug={orgSlug} membershipId={member.id} currentRole={member.role} />
                  ) : (
                    <span className="tag tag-accent">{MEMBERSHIP_ROLE_LABELS[member.role]}</span>
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
          <h6 className="text-muted mb-3">Adicionar membro</h6>
          <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
            A pessoa precisa de já ter conta no Nexa (registada em /login) — ainda não há convites por email.
          </p>
          <AddMemberForm orgSlug={orgSlug} />
        </section>
      )}
    </div>
  );
}
