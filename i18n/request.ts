import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isAppLocale } from "@/lib/i18n/config";

// No [locale] URL segment — this is an internal tool, not a public site
// needing per-language SEO. The locale comes from a cookie (set by the
// language switcher in the nav) or, on a first visit, from the browser's
// Accept-Language header.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale = isAppLocale(cookieLocale) ? cookieLocale : undefined;

  if (!locale) {
    const acceptLanguage = (await headers()).get("accept-language") ?? "";
    const preferred = acceptLanguage.split(",").map((part) => part.split(";")[0].trim().slice(0, 2));
    locale = preferred.find((code) => isAppLocale(code));
  }

  locale ??= DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
