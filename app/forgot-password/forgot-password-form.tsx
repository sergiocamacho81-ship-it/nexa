"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestPasswordReset } from "@/app/actions/auth";

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [state, action, isPending] = useActionState(requestPasswordReset, { error: null });

  if (state.success) {
    return (
      <div className="card elev-md w-full max-w-sm">
        <p className="tag tag-accent">{t("resetLinkSent")}</p>
        <a href="/login" className="btn btn-ghost btn-block">
          {t("backToLogin")}
        </a>
      </div>
    );
  }

  return (
    <div className="card elev-md w-full max-w-sm">
      <div>
        <h1 className="mb-0">{t("forgotPasswordTitle")}</h1>
        <p className="text-muted text-sm">{t("forgotPasswordHint")}</p>
      </div>

      <form action={action} className="flex flex-col gap-3">
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>

        {state.error && (
          <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn btn-primary btn-block">
          {isPending ? t("sendingResetLink") : t("sendResetLink")}
        </button>
      </form>

      <a href="/login" className="btn btn-ghost">
        {t("backToLogin")}
      </a>
    </div>
  );
}
