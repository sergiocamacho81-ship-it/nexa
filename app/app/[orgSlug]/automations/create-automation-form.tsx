"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createAutomation } from "@/app/actions/automations";
import {
  TRIGGER_TYPES,
  ACTION_TYPES,
  ACTION_TYPE_FIELDS,
  triggerMessageKey,
  type ActionType,
} from "@/lib/automation/types";

export function CreateAutomationForm({ orgSlug }: { orgSlug: string }) {
  const t = useTranslations("Automations");
  const tTriggers = useTranslations("TriggerTypes");
  const tActions = useTranslations("ActionTypes");
  const tFields = useTranslations("ActionFields");
  const [state, action, isPending] = useActionState(createAutomation, { error: null });
  const [actionType, setActionType] = useState<ActionType>("create_task");
  const fields = ACTION_TYPE_FIELDS[actionType];

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="name">{t("name")}</label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="triggerType">{t("trigger")}</label>
          <select id="triggerType" name="triggerType" className="input" defaultValue={TRIGGER_TYPES[0]}>
            {TRIGGER_TYPES.map((trigger) => (
              <option key={trigger} value={trigger}>
                {tTriggers(triggerMessageKey(trigger))}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="actionType">{t("action")}</label>
          <select
            id="actionType"
            name="actionType"
            className="input"
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ActionType)}
          >
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {tActions(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fields.map((field, index) => (
        <div className="field" key={field.key}>
          <label htmlFor={`config-${field.key}`}>{tFields(field.messageKey)}</label>
          <input type="hidden" name={index === 0 ? "configKey" : "configKey2"} value={field.key} />
          {field.type === "textarea" ? (
            <textarea
              id={`config-${field.key}`}
              name={index === 0 ? "configValue" : "configValue2"}
              className="input"
              rows={3}
            />
          ) : (
            <input
              id={`config-${field.key}`}
              name={index === 0 ? "configValue" : "configValue2"}
              type="text"
              className="input"
            />
          )}
        </div>
      ))}

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
        {isPending ? t("creating") : t("create")}
      </button>
    </form>
  );
}
