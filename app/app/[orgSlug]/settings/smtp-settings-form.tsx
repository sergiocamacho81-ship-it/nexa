"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateOrgSmtp } from "@/app/actions/settings";

type OrgSmtp = {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpFrom: string | null;
  smtpConfigured: boolean;
};

export function SmtpSettingsForm({
  orgSlug,
  organization,
  disabled,
}: {
  orgSlug: string;
  organization: OrgSmtp;
  disabled: boolean;
}) {
  const t = useTranslations("Settings");
  const [state, action, isPending] = useActionState(updateOrgSmtp, { error: null });

  return (
    <div>
      <p className="text-muted text-sm" style={{ marginBottom: "8px" }}>
        {organization.smtpConfigured
          ? t("smtpConfigured", { from: organization.smtpFrom || organization.smtpUser || "" })
          : t("smtpNotConfigured")}
      </p>

      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="orgSlug" value={orgSlug} />
        <div className="grid grid-cols-2 gap-2">
          <div className="field">
            <label htmlFor="smtpHost">{t("smtpHost")}</label>
            <input
              id="smtpHost"
              name="smtpHost"
              type="text"
              disabled={disabled}
              defaultValue={organization.smtpHost ?? ""}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="smtpPort">{t("smtpPort")}</label>
            <input
              id="smtpPort"
              name="smtpPort"
              type="number"
              min={1}
              disabled={disabled}
              defaultValue={organization.smtpPort ?? ""}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="smtpUser">{t("smtpUser")}</label>
            <input
              id="smtpUser"
              name="smtpUser"
              type="text"
              disabled={disabled}
              defaultValue={organization.smtpUser ?? ""}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="smtpPassword">{t("smtpPassword")}</label>
            <input
              id="smtpPassword"
              name="smtpPassword"
              type="password"
              disabled={disabled}
              placeholder={organization.smtpConfigured ? t("smtpPasswordHint") : ""}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="smtpFrom">{t("smtpFrom")}</label>
            <input
              id="smtpFrom"
              name="smtpFrom"
              type="email"
              disabled={disabled}
              defaultValue={organization.smtpFrom ?? ""}
              placeholder={t("smtpFromPlaceholder")}
              className="input"
            />
          </div>
          <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: "6px" }}>
            <input
              name="smtpSecure"
              type="checkbox"
              disabled={disabled}
              defaultChecked={organization.smtpSecure}
            />
            {t("smtpSecure")}
          </label>
        </div>

        {state.error && (
          <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || disabled}
          className="btn btn-primary"
          style={{ alignSelf: "flex-start" }}
        >
          {isPending ? t("smtpSaving") : t("smtpSave")}
        </button>
      </form>
    </div>
  );
}
