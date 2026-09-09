"use client";

import { useTransition } from "react";
import { deleteActivity } from "@/app/actions/activities";

export function DeleteActivityButton({
  orgSlug,
  activityId,
}: {
  orgSlug: string;
  activityId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      style={{ fontSize: "11px", padding: "2px 6px" }}
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("activityId", activityId);
        startTransition(() => deleteActivity(formData));
      }}
    >
      Remover
    </button>
  );
}
