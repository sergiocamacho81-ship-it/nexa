"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteSegment } from "@/app/actions/segments";

export function DeleteSegmentButton({ orgSlug, segmentId }: { orgSlug: string; segmentId: string }) {
  const t = useTranslations("Segments");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("segmentId", segmentId);
        startTransition(() => deleteSegment(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
