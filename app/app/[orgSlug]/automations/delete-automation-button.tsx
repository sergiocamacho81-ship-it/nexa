"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteAutomation } from "@/app/actions/automations";

export function DeleteAutomationButton({
  orgSlug,
  automationId,
}: {
  orgSlug: string;
  automationId: string;
}) {
  const t = useTranslations("Automations");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("automationId", automationId);
        startTransition(() => deleteAutomation(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
