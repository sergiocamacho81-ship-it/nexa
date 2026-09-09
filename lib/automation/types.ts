// Pure constants shared between server actions, the engine, and client UI.
// Adding a new trigger or action only touches this file plus its handler in
// lib/automation/engine.ts — no schema change needed (trigger/action type is
// just a string column, config is a JSON blob).
//
// Trigger type values contain dots ("contact.created") because that's the
// established DB/form value — but next-intl message keys can't contain dots
// (it means nesting), so translation lookups use triggerMessageKey() below.

export const TRIGGER_TYPES = ["contact.created", "deal.stage_changed", "task.completed"] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number];

// Return type is asserted rather than derived because the input can be an
// arbitrary DB string (Automation.triggerType has no literal type at the
// Prisma level) — callers know it's one of TRIGGER_TYPES at runtime.
export type TriggerMessageKey = "contact_created" | "deal_stage_changed" | "task_completed";

export function triggerMessageKey(trigger: string): TriggerMessageKey {
  return trigger.replaceAll(".", "_") as TriggerMessageKey;
}

export const ACTION_TYPES = ["create_task", "create_activity", "send_email"] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

type ActionFieldMessageKey = "taskTitle" | "activityContent" | "emailSubject" | "emailBody";

// Which config fields the UI should render for each action type, and which
// key each field writes into the action's JSON config. `messageKey` looks up
// the field label in the ActionFields message namespace.
export const ACTION_TYPE_FIELDS: Record<
  ActionType,
  { key: string; messageKey: ActionFieldMessageKey; type: "text" | "textarea" }[]
> = {
  create_task: [{ key: "title", messageKey: "taskTitle", type: "text" }],
  create_activity: [{ key: "content", messageKey: "activityContent", type: "textarea" }],
  send_email: [
    { key: "subject", messageKey: "emailSubject", type: "text" },
    { key: "body", messageKey: "emailBody", type: "textarea" },
  ],
};
