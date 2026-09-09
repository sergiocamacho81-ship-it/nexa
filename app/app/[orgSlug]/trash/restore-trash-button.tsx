"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { restoreTrashItem } from "@/app/actions/trash";
import type { TrashType } from "@/lib/trash-types";

export function RestoreTrashButton({
  orgSlug,
  type,
  id,
}: {
  orgSlug: string;
  type: TrashType;
  id: string;
}) {
  const t = useTranslations("Trash");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("type", type);
        formData.set("id", id);
        startTransition(() => {
          void restoreTrashItem(formData);
        });
      }}
    >
      {isPending ? t("restoring") : t("restore")}
    </button>
  );
}
