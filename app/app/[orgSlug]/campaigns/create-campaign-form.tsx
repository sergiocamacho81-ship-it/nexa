"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCampaign } from "@/app/actions/campaigns";

type Segment = { id: string; name: string; contactCount: number };

export function CreateCampaignForm({ orgSlug, segments }: { orgSlug: string; segments: Segment[] }) {
  const t = useTranslations("Campaigns");
  const [state, action, isPending] = useActionState(createCampaign, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="field">
        <label htmlFor="name">{t("name")}</label>
        <input id="name" name="name" type="text" required className="input" />
      </div>
      <div className="field">
        <label htmlFor="segmentId">{t("segment")}</label>
        <select id="segmentId" name="segmentId" className="input" defaultValue="">
          <option value="">{t("allContactsWithEmail")}</option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {t("segmentOption", { name: segment.name, count: segment.contactCount })}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="subject">{t("subject")}</label>
        <input id="subject" name="subject" type="text" required className="input" />
      </div>
      <div className="field">
        <label htmlFor="body">{t("message")}</label>
        <textarea id="body" name="body" required className="input" rows={5} />
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        {isPending ? t("creating") : t("createDraft")}
      </button>
    </form>
  );
}
