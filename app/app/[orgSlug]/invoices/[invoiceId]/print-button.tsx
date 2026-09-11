"use client";

import { useTranslations } from "next-intl";

export function PrintButton() {
  const t = useTranslations("Invoices");

  return (
    <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
      {t("print")}
    </button>
  );
}
