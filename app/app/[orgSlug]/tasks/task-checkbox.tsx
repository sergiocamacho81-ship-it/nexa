"use client";

import { useTransition } from "react";
import { toggleTaskStatus } from "@/app/actions/tasks";

export function TaskCheckbox({
  orgSlug,
  taskId,
  isCompleted,
}: {
  orgSlug: string;
  taskId: string;
  isCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={isCompleted}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("taskId", taskId);
        formData.set("status", e.target.checked ? "COMPLETED" : "PENDING");
        startTransition(() => toggleTaskStatus(formData));
      }}
      style={{ width: "18px", height: "18px", accentColor: "var(--color-accent)" }}
    />
  );
}
