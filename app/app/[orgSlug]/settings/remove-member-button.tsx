"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { removeMember } from "@/app/actions/settings";

export function RemoveMemberButton({
  orgSlug,
  membershipId,
}: {
  orgSlug: string;
  membershipId: string;
}) {
  const t = useTranslations("Settings");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        className="btn btn-ghost"
        onClick={() => {
          setError(null);
          const formData = new FormData();
          formData.set("orgSlug", orgSlug);
          formData.set("membershipId", membershipId);
          startTransition(async () => {
            try {
              await removeMember(formData);
            } catch (err) {
              setError(err instanceof Error ? err.message : t("errorUnknown"));
            }
          });
        }}
      >
        {t("remove")}
      </button>
      {error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
