"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteCompany } from "@/app/actions/companies";

export function DeleteCompanyButton({
  orgSlug,
  companyId,
}: {
  orgSlug: string;
  companyId: string;
}) {
  const t = useTranslations("Companies");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("companyId", companyId);
        startTransition(() => deleteCompany(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
