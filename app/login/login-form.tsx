"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { signIn, signUp } from "@/app/actions/auth";

export function LoginForm() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const checkEmail = searchParams.get("checkEmail") === "1";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = mode === "signin" ? signIn : signUp;
      const result = await action(formData);
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="card elev-md w-full max-w-sm">
      <div>
        <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
          <Image src="/logo-mark.svg" alt={t("brand")} width={16} height={16} />
          <span
            className="text-muted"
            style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            {t("brand")}
          </span>
        </div>
        <h1 className="mb-0" style={{ fontSize: "52px" }}>
          Nexa
        </h1>
        <p className="text-muted text-sm">
          {mode === "signin" ? t("signInTitle") : t("signUpTitle")}
        </p>
      </div>

      {checkEmail && <p className="tag tag-accent">{t("checkEmail")}</p>}

      <form action={handleSubmit} className="flex flex-col gap-3">
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="password">{t("password")}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="input"
          />
        </div>

        {mode === "signin" && (
          <a href="/forgot-password" className="text-sm text-muted">
            {t("forgotPassword")}
          </a>
        )}

        {error && <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>{error}</p>}

        <button type="submit" disabled={isPending} className="btn btn-primary btn-block">
          {isPending ? t("pending") : mode === "signin" ? t("signInButton") : t("signUpButton")}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="btn btn-ghost"
      >
        {mode === "signin" ? t("toggleToSignUp") : t("toggleToSignIn")}
      </button>
    </div>
  );
}
