"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

type AuthResult = { error: string } | never;

// Supabase's own auth errors are always in English; map the common ones to a
// translated message and fall back to the raw message for anything else.
async function translateAuthError(code: string | undefined, fallback: string): Promise<string> {
  const t = await getTranslations("Auth");
  switch (code) {
    case "invalid_credentials":
      return t("errorInvalidCredentials");
    case "email_exists":
    case "user_already_exists":
      return t("errorEmailExists");
    case "weak_password":
      return t("errorWeakPassword");
    case "email_not_confirmed":
      return t("errorEmailNotConfirmed");
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return t("errorRateLimit");
    default:
      return fallback;
  }
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    const t = await getTranslations("Auth");
    return { error: t("errorRequiredFields") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: await translateAuthError(error.code, error.message) };
  }

  redirect("/login?checkEmail=1");
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    const t = await getTranslations("Auth");
    return { error: t("errorRequiredFields") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: await translateAuthError(error.code, error.message) };
  }

  redirect("/app");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
