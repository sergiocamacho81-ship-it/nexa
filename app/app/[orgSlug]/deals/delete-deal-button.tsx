"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteDeal } from "@/app/actions/deals";

export function DeleteDealButton({ orgSlug, dealId }: { orgSlug: string; dealId: string }) {
  const t = useTranslations("Deals");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      style={{ fontSize: "12px", padding: "2px 6px" }}
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("dealId", dealId);
        startTransition(() => deleteDeal(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
