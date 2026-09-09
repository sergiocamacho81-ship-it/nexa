"use client";

import { useTransition } from "react";
import { toggleAutomationEnabled } from "@/app/actions/automations";

export function AutomationToggle({
  orgSlug,
  automationId,
  enabled,
}: {
  orgSlug: string;
  automationId: string;
  enabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2" style={{ fontSize: "13px", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={enabled}
        disabled={isPending}
        onChange={(e) => {
          const formData = new FormData();
          formData.set("orgSlug", orgSlug);
          formData.set("automationId", automationId);
          formData.set("enabled", e.target.checked ? "true" : "false");
          startTransition(() => toggleAutomationEnabled(formData));
        }}
        style={{ width: "16px", height: "16px", accentColor: "var(--color-accent)" }}
      />
      {enabled ? "Ativa" : "Desativada"}
    </label>
  );
}
