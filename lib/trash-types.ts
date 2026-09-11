export const TRASH_TYPES = [
  "contact",
  "company",
  "deal",
  "job",
  "activity",
  "task",
  "segment",
  "automation",
  "campaign",
  "member",
  "product",
  "invoice",
] as const;
export type TrashType = (typeof TRASH_TYPES)[number];
