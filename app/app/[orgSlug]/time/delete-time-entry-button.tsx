"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteTimeEntry } from "@/app/actions/time-entries";

export function DeleteTimeEntryButton({
  orgSlug,
  timeEntryId,
}: {
  orgSlug: string;
  timeEntryId: string;
}) {
  const t = useTranslations("TimeEntries");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("timeEntryId", timeEntryId);
        startTransition(() => deleteTimeEntry(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
