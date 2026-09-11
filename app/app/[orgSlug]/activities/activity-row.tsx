"use client";

import { useActionState, useState } from "react";
import type { Prisma } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { updateActivity } from "@/app/actions/activities";
import { DeleteActivityButton } from "./delete-activity-button";
import { ACTIVITY_TYPES } from "@/lib/activity-types";

type ActivityWithRelations = Prisma.ActivityGetPayload<{
  include: {
    contact: { select: { id: true; firstName: true; lastName: true } };
    company: { select: { id: true; name: true } };
    deal: { select: { id: true; title: true } };
  };
}>;
type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };
type Deal = { id: string; title: string };

export function ActivityRow({
  orgSlug,
  activity,
  companies,
  contacts,
  deals,
}: {
  orgSlug: string;
  activity: ActivityWithRelations;
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
}) {
  const t = useTranslations("Activities");
  const tTypes = useTranslations("ActivityTypes");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateActivity, { error: null });

  if (editing) {
    return (
      <div className="card elev-sm">
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="activityId" value={activity.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field">
              <label htmlFor={`type-${activity.id}`}>{t("type")}</label>
              <select
                id={`type-${activity.id}`}
                name="type"
                className="input"
                defaultValue={activity.type}
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {tTypes(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`contactId-${activity.id}`}>{t("contact")}</label>
              <select
                id={`contactId-${activity.id}`}
                name="contactId"
                className="input"
                defaultValue={activity.contactId ?? ""}
              >
                <option value="">{t("noContact")}</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName ?? ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`companyId-${activity.id}`}>{t("company")}</label>
              <select
                id={`companyId-${activity.id}`}
                name="companyId"
                className="input"
                defaultValue={activity.companyId ?? ""}
              >
                <option value="">{t("noCompany")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`dealId-${activity.id}`}>{t("deal")}</label>
              <select
                id={`dealId-${activity.id}`}
                name="dealId"
                className="input"
                defaultValue={activity.dealId ?? ""}
              >
                <option value="">{t("noDeal")}</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor={`content-${activity.id}`}>{t("description")}</label>
            <textarea
              id={`content-${activity.id}`}
              name="content"
              required
              className="input"
              rows={3}
              defaultValue={activity.content}
            />
          </div>

          {state.error && (
            <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
              {state.error}
            </p>
          )}

          <div className="flex gap-2" style={{ alignSelf: "flex-start" }}>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? t("saving") : t("save")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card elev-sm">
      <div className="flex items-center justify-between">
        <span className="tag tag-accent">{tTypes(activity.type)}</span>
        <span className="card-meta">
          {new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(
            activity.occurredAt,
          )}
        </span>
      </div>
      <p className="card-body">{activity.content}</p>
      <div className="card-meta flex-wrap">
        {activity.contact && (
          <span>
            {activity.contact.firstName} {activity.contact.lastName ?? ""}
          </span>
        )}
        {activity.company && <span>{activity.company.name}</span>}
        {activity.deal && <span>{activity.deal.title}</span>}
        <button
          type="button"
          className="btn btn-ghost"
          style={{ fontSize: "11px", padding: "2px 6px" }}
          onClick={() => setEditing(true)}
        >
          {t("edit")}
        </button>
        <DeleteActivityButton orgSlug={orgSlug} activityId={activity.id} />
      </div>
    </div>
  );
}
