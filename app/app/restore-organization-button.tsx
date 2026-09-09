"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { restoreOrganization } from "@/app/actions/organizations";

export function RestoreOrganizationButton({ organizationId }: { organizationId: string }) {
  const t = useTranslations("Organizations");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("organizationId", organizationId);
        startTransition(() => restoreOrganization(formData));
      }}
    >
      {isPending ? t("restoring") : t("restore")}
    </button>
  );
}
