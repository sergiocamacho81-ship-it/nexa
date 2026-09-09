// Pure constants shared between server actions, the engine, and client UI.
// Adding a new trigger or action only touches this file plus its handler in
// lib/automation/engine.ts — no schema change needed (trigger/action type is
// just a string column, config is a JSON blob).

export const TRIGGER_TYPES = ["contact.created", "deal.stage_changed", "task.completed"] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number];

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  "contact.created": "Contacto criado",
  "deal.stage_changed": "Negócio muda de estágio",
  "task.completed": "Tarefa concluída",
};

export const ACTION_TYPES = ["create_task", "create_activity", "send_email"] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  create_task: "Criar tarefa",
  create_activity: "Registar atividade",
  send_email: "Enviar email",
};

// Which config fields the UI should render for each action type, and which
// key each field writes into the action's JSON config.
export const ACTION_TYPE_FIELDS: Record<
  ActionType,
  { key: string; label: string; type: "text" | "textarea" }[]
> = {
  create_task: [{ key: "title", label: "Título da tarefa", type: "text" }],
  create_activity: [{ key: "content", label: "Descrição da atividade", type: "textarea" }],
  send_email: [
    { key: "subject", label: "Assunto", type: "text" },
    { key: "body", label: "Mensagem", type: "textarea" },
  ],
};
