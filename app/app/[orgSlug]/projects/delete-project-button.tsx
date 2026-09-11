"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteProject } from "@/app/actions/projects";

export function DeleteProjectButton({ orgSlug, projectId }: { orgSlug: string; projectId: string }) {
  const t = useTranslations("Projects");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("projectId", projectId);
        startTransition(() => deleteProject(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
