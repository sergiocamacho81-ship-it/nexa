"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("LocaleSwitcher");
  const [isPending, startTransition] = useTransition();

  return (
    <select
      aria-label={t("label")}
      className="input"
      style={{ fontSize: "12px", minHeight: "28px", padding: "2px 6px", width: "auto" }}
      defaultValue={locale}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("locale", e.target.value);
        startTransition(() => setLocale(formData));
      }}
    >
      {LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
