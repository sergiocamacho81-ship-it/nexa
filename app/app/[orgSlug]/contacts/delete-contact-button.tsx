"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteContact } from "@/app/actions/contacts";

export function DeleteContactButton({
  orgSlug,
  contactId,
}: {
  orgSlug: string;
  contactId: string;
}) {
  const t = useTranslations("Contacts");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("contactId", contactId);
        startTransition(() => deleteContact(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
