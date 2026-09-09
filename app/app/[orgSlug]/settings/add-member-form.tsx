"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addMember } from "@/app/actions/settings";
import { MEMBERSHIP_ROLES } from "@/lib/membership-roles";

export function AddMemberForm({ orgSlug }: { orgSlug: string }) {
  const t = useTranslations("Settings");
  const tRoles = useTranslations("MembershipRoles");
  const [state, action, isPending] = useActionState(addMember, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          required
          className="input flex-1"
        />
        <select name="role" className="input" defaultValue="MEMBER" style={{ width: "140px" }}>
          {MEMBERSHIP_ROLES.map((role) => (
            <option key={role} value={role}>
              {tRoles(role)}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? t("adding") : t("add")}
        </button>
      </div>
      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}
    </form>
  );
}
