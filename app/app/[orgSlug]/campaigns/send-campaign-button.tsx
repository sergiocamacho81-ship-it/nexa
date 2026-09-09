"use client";

import { useTransition } from "react";
import { sendCampaign } from "@/app/actions/campaigns";

export function SendCampaignButton({
  orgSlug,
  campaignId,
}: {
  orgSlug: string;
  campaignId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-primary"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("campaignId", campaignId);
        startTransition(() => sendCampaign(formData));
      }}
    >
      {isPending ? "A enviar..." : "Enviar agora"}
    </button>
  );
}
