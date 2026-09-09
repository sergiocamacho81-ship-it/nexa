"use client";

import { useTransition } from "react";
import { deleteAutomation } from "@/app/actions/automations";

export function DeleteAutomationButton({
  orgSlug,
  automationId,
}: {
  orgSlug: string;
  automationId: string;
}) {
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
      Remover
    </button>
  );
}
