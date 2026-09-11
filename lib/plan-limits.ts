import { prisma } from "@/lib/prisma";

// FREE is the only capped tier — PRO (paid) and GRANDFATHERED (pre-billing
// orgs, kept free for good) are both unlimited. Deliberately generous enough
// to actually try the product with real data, tight enough that a genuinely
// active solo user outgrows it in weeks, not months.
export const FREE_PLAN_LIMITS = {
  contacts: 25,
  members: 1,
  activeDeals: 10,
} as const;

export type PlanLimitKind = keyof typeof FREE_PLAN_LIMITS;

function isCapped(planTier: string): boolean {
  return planTier === "FREE";
}

// Counts what a given limit kind actually measures right now and compares
// it against the FREE cap. Returns null (no limit hit) for PRO/GRANDFATHERED
// orgs without even querying the count.
export async function checkPlanLimit(
  organization: { id: string; planTier: string },
  kind: PlanLimitKind,
): Promise<{ limited: true; limit: number; current: number } | { limited: false }> {
  if (!isCapped(organization.planTier)) return { limited: false };

  const limit = FREE_PLAN_LIMITS[kind];
  let current: number;

  switch (kind) {
    case "contacts":
      current = await prisma.contact.count({
        where: { organizationId: organization.id, deletedAt: null },
      });
      break;
    case "members":
      current = await prisma.membership.count({
        where: { organizationId: organization.id, deletedAt: null },
      });
      break;
    case "activeDeals":
      current = await prisma.deal.count({
        where: {
          organizationId: organization.id,
          deletedAt: null,
          stage: { notIn: ["WON", "LOST"] },
        },
      });
      break;
  }

  return current >= limit ? { limited: true, limit, current } : { limited: false };
}

// For the Settings "Plan" section: current usage against each limit,
// regardless of whether the org is actually capped (so a PRO/GRANDFATHERED
// org can still see "12 / unlimited" style numbers if useful later).
export async function getPlanUsage(organizationId: string) {
  const [contacts, members, activeDeals] = await Promise.all([
    prisma.contact.count({ where: { organizationId, deletedAt: null } }),
    prisma.membership.count({ where: { organizationId, deletedAt: null } }),
    prisma.deal.count({
      where: { organizationId, deletedAt: null, stage: { notIn: ["WON", "LOST"] } },
    }),
  ]);
  return { contacts, members, activeDeals };
}
