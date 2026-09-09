"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateDealStage } from "@/app/actions/deals";
import { DEAL_STAGES } from "@/lib/deal-stages";

export function StageSelect({
  orgSlug,
  dealId,
  currentStage,
}: {
  orgSlug: string;
  dealId: string;
  currentStage: (typeof DEAL_STAGES)[number];
}) {
  const tStages = useTranslations("DealStages");
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="input"
      style={{ fontSize: "12px", minHeight: "28px", padding: "2px 6px" }}
      defaultValue={currentStage}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("dealId", dealId);
        formData.set("stage", e.target.value);
        startTransition(() => updateDealStage(formData));
      }}
    >
      {DEAL_STAGES.map((stage) => (
        <option key={stage} value={stage}>
          {tStages(stage)}
        </option>
      ))}
    </select>
  );
}
