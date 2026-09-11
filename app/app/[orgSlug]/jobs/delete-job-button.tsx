"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteJob } from "@/app/actions/jobs";

export function DeleteJobButton({ orgSlug, jobId }: { orgSlug: string; jobId: string }) {
  const t = useTranslations("Jobs");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("jobId", jobId);
        startTransition(() => deleteJob(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
