"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteOrganization } from "@/app/actions/organizations";

export function DeleteOrganizationButton({
  organizationId,
  organizationName,
}: {
  organizationId: string;
  organizationName: string;
}) {
  const t = useTranslations("Settings");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        className="btn btn-primary"
        style={{ background: "var(--color-accent-700)", borderColor: "var(--color-accent-700)" }}
        onClick={() => {
          if (!window.confirm(t("deleteOrgConfirm", { name: organizationName }))) return;
          setError(null);
          const formData = new FormData();
          formData.set("organizationId", organizationId);
          startTransition(async () => {
            try {
              await deleteOrganization(formData);
              router.push("/app");
            } catch (err) {
              setError(err instanceof Error ? err.message : t("errorUnknown"));
            }
          });
        }}
      >
        {t("deleteOrgButton")}
      </button>
      {error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)", marginTop: "6px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
