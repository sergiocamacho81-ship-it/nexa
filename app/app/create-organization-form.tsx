"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createOrganization } from "@/app/actions/organizations";

export function CreateOrganizationForm() {
  const t = useTranslations("Organizations");
  const [state, action, isPending] = useActionState(createOrganization, {
    error: null,
  });

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder={t("namePlaceholder")}
          required
          className="input flex-1"
        />
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? t("creating") : t("create")}
        </button>
      </div>
      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}
    </form>
  );
}
