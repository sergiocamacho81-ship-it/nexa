"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isAppLocale } from "@/lib/i18n/config";

export async function setLocale(formData: FormData) {
  const locale = String(formData.get("locale") ?? "");
  if (!isAppLocale(locale)) {
    throw new Error("Invalid locale");
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  // Every Server Component reads the locale from this cookie via
  // i18n/request.ts, so the whole tree needs to re-render for the switch to
  // take effect anywhere.
  revalidatePath("/", "layout");
}
