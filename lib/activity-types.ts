export const ACTIVITY_TYPES = ["CALL", "EMAIL", "MEETING", "NOTE"] as const;

export const ACTIVITY_TYPE_LABELS: Record<(typeof ACTIVITY_TYPES)[number], string> = {
  CALL: "Chamada",
  EMAIL: "Email",
  MEETING: "Reunião",
  NOTE: "Nota",
};
