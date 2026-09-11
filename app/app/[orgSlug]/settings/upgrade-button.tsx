"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCheckoutSession } from "@/app/actions/billing";

export function UpgradeButton({ orgSlug }: { orgSlug: string }) {
  const t = useTranslations("Billing");
  const [state, action, isPending] = useActionState(createCheckoutSession, { error: null });

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {t("upgradeButton")}
        </button>
      </form>
      {state.error && (
        <p className="text-sm text-muted" style={{ marginTop: "6px" }}>
          {state.error}
        </p>
      )}
    </div>
  );
}
