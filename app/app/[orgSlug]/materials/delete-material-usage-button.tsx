"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteMaterialUsage } from "@/app/actions/material-usages";

export function DeleteMaterialUsageButton({
  orgSlug,
  materialUsageId,
}: {
  orgSlug: string;
  materialUsageId: string;
}) {
  const t = useTranslations("Materials");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("materialUsageId", materialUsageId);
        startTransition(() => deleteMaterialUsage(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
