export const LOCALES = ["pt", "en", "fr", "de", "it"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "pt";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
