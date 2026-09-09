"use client";

import { useState, useTransition } from "react";
import { updateMemberRole } from "@/app/actions/settings";
import { MEMBERSHIP_ROLES, MEMBERSHIP_ROLE_LABELS } from "@/lib/membership-roles";

export function MemberRoleSelect({
  orgSlug,
  membershipId,
  currentRole,
}: {
  orgSlug: string;
  membershipId: string;
  currentRole: (typeof MEMBERSHIP_ROLES)[number];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <select
        className="input"
        style={{ fontSize: "12px", minHeight: "28px", padding: "2px 6px" }}
        defaultValue={currentRole}
        disabled={isPending}
        onChange={(e) => {
          const value = e.target.value;
          setError(null);
          const formData = new FormData();
          formData.set("orgSlug", orgSlug);
          formData.set("membershipId", membershipId);
          formData.set("role", value);
          startTransition(async () => {
            try {
              await updateMemberRole(formData);
            } catch (err) {
              e.target.value = currentRole;
              setError(err instanceof Error ? err.message : "Erro desconhecido.");
            }
          });
        }}
      >
        {MEMBERSHIP_ROLES.map((role) => (
          <option key={role} value={role}>
            {MEMBERSHIP_ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
