"use client";

import { useEffect, useState, useActionState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/app/actions/auth";

// Supabase's password-recovery email link lands here with the session in the
// URL fragment (never sent to the server) — the browser client picks it up
// on mount and fires PASSWORD_RECOVERY. We gate the form on that event
// rather than assuming the link is valid, since an expired/reused link
// leaves no session at all.
export function ResetPasswordForm() {
  const t = useTranslations("ResetPassword");
  const [status, setStatus] = useState<"waiting" | "ready" | "invalid">("waiting");
  const [state, action, isPending] = useActionState(updatePassword, { error: null });

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        settled = true;
        setStatus("ready");
      }
    });

    const timeout = setTimeout(async () => {
      if (settled) return;
      const { data } = await supabase.auth.getSession();
      setStatus(data.session ? "ready" : "invalid");
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (status === "invalid") {
    return (
      <div className="card elev-md w-full max-w-sm">
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {t("invalidLink")}
        </p>
        <a href="/forgot-password" className="btn btn-primary btn-block">
          {t("requestNewLink")}
        </a>
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <div className="card elev-md w-full max-w-sm">
        <p className="text-muted text-sm">{t("hint")}</p>
      </div>
    );
  }

  return (
    <div className="card elev-md w-full max-w-sm">
      <div>
        <h1 className="mb-0">{t("title")}</h1>
        <p className="text-muted text-sm">{t("hint")}</p>
      </div>

      <form action={action} className="flex flex-col gap-3">
        <div className="field">
          <label htmlFor="password">{t("newPassword")}</label>
          <input id="password" name="password" type="password" required minLength={6} className="input" />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            className="input"
          />
        </div>

        {state.error && (
          <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn btn-primary btn-block">
          {isPending ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
