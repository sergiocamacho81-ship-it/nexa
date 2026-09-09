"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { importContacts } from "@/app/actions/contacts";

export function ImportContactsButton({ orgSlug }: { orgSlug: string }) {
  const t = useTranslations("Contacts");
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(importContacts, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>
        {t("importButton")}
      </button>
    );
  }

  return (
    <div className="card elev-sm" style={{ maxWidth: "420px" }}>
      <p className="card-title" style={{ marginBottom: "4px" }}>
        {t("importTitle")}
      </p>
      <p className="text-muted text-sm">{t("importHint")}</p>
      <p className="text-muted" style={{ fontSize: "11px" }}>
        {t("importColumns")}
      </p>

      <form ref={formRef} action={action} className="flex flex-col gap-2">
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <input type="file" name="file" accept=".csv,text/csv" required className="input" />

        {state.error && (
          <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
            {state.error}
          </p>
        )}

        {state.summary && (
          <div>
            <p className="text-sm">
              {t("importSummary", { created: state.summary.created, failed: state.summary.failed })}
            </p>
            {state.summary.errors.length > 0 && (
              <ul className="text-sm" style={{ color: "var(--color-accent-700)" }}>
                {state.summary.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2" style={{ alignSelf: "flex-start" }}>
          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? t("importing") : t("importSubmit")}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              formRef.current?.reset();
              setOpen(false);
            }}
          >
            {t("close")}
          </button>
        </div>
      </form>
    </div>
  );
}
