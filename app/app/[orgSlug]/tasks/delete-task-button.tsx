"use client";

import { useTransition } from "react";
import { deleteTask } from "@/app/actions/tasks";

export function DeleteTaskButton({ orgSlug, taskId }: { orgSlug: string; taskId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("taskId", taskId);
        startTransition(() => deleteTask(formData));
      }}
    >
      Remover
    </button>
  );
}
