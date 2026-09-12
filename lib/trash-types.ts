export const TRASH_TYPES = [
  "contact",
  "company",
  "deal",
  "job",
  "project",
  "timeEntry",
  "materialUsage",
  "activity",
  "task",
  "segment",
  "automation",
  "campaign",
  "member",
  "product",
  "quote",
  "invoice",
] as const;
export type TrashType = (typeof TRASH_TYPES)[number];
