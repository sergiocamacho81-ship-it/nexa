import type { Prisma } from "@prisma/client";
import { SWISS_CANTONS } from "@/lib/swiss-cantons";

// A Segment's filter is a small structured shape, not a free-form query
// language. Add a new field here + in buildContactWhere to extend it.
export type SegmentFilters = {
  companyId?: string;
  hasEmail?: boolean;
  createdAfter?: string; // ISO date (yyyy-mm-dd)
  createdBefore?: string; // ISO date (yyyy-mm-dd)
  canton?: (typeof SWISS_CANTONS)[number];
  city?: string;
};

export function parseSegmentFilters(value: unknown): SegmentFilters {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const filters: SegmentFilters = {};
  if (typeof raw.companyId === "string" && raw.companyId) filters.companyId = raw.companyId;
  if (typeof raw.hasEmail === "boolean") filters.hasEmail = raw.hasEmail;
  if (typeof raw.createdAfter === "string" && raw.createdAfter) filters.createdAfter = raw.createdAfter;
  if (typeof raw.createdBefore === "string" && raw.createdBefore) filters.createdBefore = raw.createdBefore;
  if (
    typeof raw.canton === "string" &&
    SWISS_CANTONS.includes(raw.canton as (typeof SWISS_CANTONS)[number])
  ) {
    filters.canton = raw.canton as (typeof SWISS_CANTONS)[number];
  }
  if (typeof raw.city === "string" && raw.city) filters.city = raw.city;
  return filters;
}

export function buildContactWhere(
  organizationId: string,
  filters: SegmentFilters,
): Prisma.ContactWhereInput {
  const where: Prisma.ContactWhereInput = { organizationId };

  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.hasEmail === true) where.email = { not: null };
  if (filters.hasEmail === false) where.email = null;
  if (filters.canton) where.canton = filters.canton;
  if (filters.city) where.city = { equals: filters.city, mode: "insensitive" };

  if (filters.createdAfter || filters.createdBefore) {
    where.createdAt = {
      ...(filters.createdAfter ? { gte: new Date(filters.createdAfter) } : {}),
      ...(filters.createdBefore ? { lte: new Date(filters.createdBefore) } : {}),
    };
  }

  return where;
}

type SegmentsFilterKey =
  | "filterHasCompany"
  | "filterHasEmail"
  | "filterNoEmail"
  | "filterCreatedAfter"
  | "filterCreatedBefore"
  | "filterCanton"
  | "filterCity"
  | "filterNone";

// `t` is a next-intl translator scoped to the Segments namespace (server or
// client — this function itself has no i18n dependency, just takes one in).
// `tCantons` is scoped to the Cantons namespace, used only when a canton
// filter is set.
export function describeSegmentFilters(
  filters: SegmentFilters,
  t: (key: SegmentsFilterKey, values?: Record<string, string>) => string,
  tCantons?: (canton: (typeof SWISS_CANTONS)[number]) => string,
): string {
  const parts: string[] = [];
  if (filters.companyId) parts.push(t("filterHasCompany"));
  if (filters.hasEmail === true) parts.push(t("filterHasEmail"));
  if (filters.hasEmail === false) parts.push(t("filterNoEmail"));
  if (filters.canton) {
    parts.push(t("filterCanton", { canton: tCantons ? tCantons(filters.canton) : filters.canton }));
  }
  if (filters.city) parts.push(t("filterCity", { city: filters.city }));
  if (filters.createdAfter) parts.push(t("filterCreatedAfter", { date: filters.createdAfter }));
  if (filters.createdBefore) parts.push(t("filterCreatedBefore", { date: filters.createdBefore }));
  return parts.length > 0 ? parts.join(", ") : t("filterNone");
}
