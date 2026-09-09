"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

export type PasswordResetRequestState = { error: string | null; success?: boolean };

export async function requestPasswordReset(
  _prevState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim();
  const t = await getTranslations("Auth");
  if (!email) {
    return { error: t("errorRequiredFields") };
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { error: await translateAuthError(error.code, error.message) };
  }

  return { error: null, success: true };
}

export type UpdatePasswordState = { error: string | null };

// Called from /reset-password once the browser client has picked up the
// recovery session from the email link's URL fragment (see
// reset-password-form.tsx) — that session is cookie-based via @supabase/ssr,
// so it's already visible to this Server Action by the time the form submits.
export async function updatePassword(
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const t = await getTranslations("ResetPassword");

  if (password.length < 6) {
    return { error: t("errorPasswordTooShort") };
  }
  if (password !== confirmPassword) {
    return { error: t("errorPasswordMismatch") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: t("errorUpdateFailed") };
  }

  redirect("/app");
}
