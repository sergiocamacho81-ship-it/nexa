"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteCampaign } from "@/app/actions/campaigns";

export function DeleteCampaignButton({
  orgSlug,
  campaignId,
}: {
  orgSlug: string;
  campaignId: string;
}) {
  const t = useTranslations("Campaigns");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("campaignId", campaignId);
        startTransition(() => deleteCampaign(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
