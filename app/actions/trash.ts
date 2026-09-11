"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/organizations";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBERSHIP_ROLES } from "@/lib/membership-roles";
import { TRASH_TYPES, type TrashType } from "@/lib/trash-types";
import { checkPlanLimit } from "@/lib/plan-limits";

const RETENTION_DAYS = 30;

type Role = (typeof MEMBERSHIP_ROLES)[number];
const MANAGER_ROLES: Role[] = ["OWNER", "ADMIN"];

export type TrashItem = {
  type: TrashType;
  id: string;
  label: string;
  deletedAt: Date;
};

async function assertCanManage(organizationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId }, deletedAt: null },
  });
  if (!membership || !MANAGER_ROLES.includes(membership.role)) {
    throw new Error("Only OWNER/ADMIN can manage the trash.");
  }
}

// Nothing purges on a schedule (no cron infra yet — see docs/PLATFORM_ADMIN.md)
// so this runs a lazy sweep, hard-deleting anything past the retention
// window, every time the trash view is opened.
async function purgeExpired(organizationId: string) {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const where = { organizationId, deletedAt: { lt: cutoff } };
  await Promise.all([
    prisma.contact.deleteMany({ where }),
    prisma.company.deleteMany({ where }),
    prisma.deal.deleteMany({ where }),
    prisma.activity.deleteMany({ where }),
    prisma.task.deleteMany({ where }),
    prisma.segment.deleteMany({ where }),
    prisma.automation.deleteMany({ where }),
    prisma.campaign.deleteMany({ where }),
    prisma.membership.deleteMany({ where }),
  ]);
}

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listTrash(orgSlug: string): Promise<TrashItem[]> {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  await purgeExpired(organization.id);

  const where = { organizationId: organization.id, deletedAt: { not: null } };
  const [contacts, companies, deals, activities, tasks, segments, automations, campaigns, memberships] =
    await Promise.all([
      prisma.contact.findMany({ where }),
      prisma.company.findMany({ where }),
      prisma.deal.findMany({ where }),
      prisma.activity.findMany({ where }),
      prisma.task.findMany({ where }),
      prisma.segment.findMany({ where }),
      prisma.automation.findMany({ where }),
      prisma.campaign.findMany({ where }),
      prisma.membership.findMany({ where }),
    ]);

  let memberEmails = new Map<string, string>();
  if (memberships.length > 0) {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (data) {
      memberEmails = new Map(
        data.users.filter((u) => u.email).map((u) => [u.id, u.email as string]),
      );
    }
  }

  const items: TrashItem[] = [
    ...contacts.map((c) => ({
      type: "contact" as const,
      id: c.id,
      label: [c.firstName, c.lastName].filter(Boolean).join(" "),
      deletedAt: c.deletedAt as Date,
    })),
    ...companies.map((c) => ({
      type: "company" as const,
      id: c.id,
      label: c.name,
      deletedAt: c.deletedAt as Date,
    })),
    ...deals.map((d) => ({
      type: "deal" as const,
      id: d.id,
      label: d.title,
      deletedAt: d.deletedAt as Date,
    })),
    ...activities.map((a) => ({
      type: "activity" as const,
      id: a.id,
      label: a.content.length > 60 ? `${a.content.slice(0, 60)}…` : a.content,
      deletedAt: a.deletedAt as Date,
    })),
    ...tasks.map((t) => ({
      type: "task" as const,
      id: t.id,
      label: t.title,
      deletedAt: t.deletedAt as Date,
    })),
    ...segments.map((s) => ({
      type: "segment" as const,
      id: s.id,
      label: s.name,
      deletedAt: s.deletedAt as Date,
    })),
    ...automations.map((a) => ({
      type: "automation" as const,
      id: a.id,
      label: a.name,
      deletedAt: a.deletedAt as Date,
    })),
    ...campaigns.map((c) => ({
      type: "campaign" as const,
      id: c.id,
      label: c.name,
      deletedAt: c.deletedAt as Date,
    })),
    ...memberships.map((m) => ({
      type: "member" as const,
      id: m.id,
      label: memberEmails.get(m.userId) ?? m.userId,
      deletedAt: m.deletedAt as Date,
    })),
  ];

  return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}

export async function restoreTrashItem(formData: FormData) {
  const t = await getTranslations("Trash");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const type = String(formData.get("type") ?? "") as TrashType;
  const id = String(formData.get("id") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");
  await assertCanManage(organization.id);

  if (!TRASH_TYPES.includes(type)) throw new Error("Invalid type");

  // Restoring something soft-deleted grows the active count the same way
  // creating a new one would, so it's gated by the same plan limits.
  const limitKindByType: Partial<Record<TrashType, "contacts" | "members" | "activeDeals">> = {
    contact: "contacts",
    member: "members",
    deal: "activeDeals",
  };
  const limitKind = limitKindByType[type];
  if (limitKind) {
    const limitCheck = await checkPlanLimit(organization, limitKind);
    if (limitCheck.limited) {
      throw new Error(t("errorPlanLimitRestore", { limit: limitCheck.limit }));
    }
  }

  const where = { id, organizationId: organization.id, deletedAt: { not: null } };
  const data = { deletedAt: null };

  switch (type) {
    case "contact":
      await prisma.contact.updateMany({ where, data });
      break;
    case "company":
      await prisma.company.updateMany({ where, data });
      break;
    case "deal":
      await prisma.deal.updateMany({ where, data });
      break;
    case "activity":
      await prisma.activity.updateMany({ where, data });
      break;
    case "task":
      await prisma.task.updateMany({ where, data });
      break;
    case "segment":
      await prisma.segment.updateMany({ where, data });
      break;
    case "automation":
      await prisma.automation.updateMany({ where, data });
      break;
    case "campaign":
      await prisma.campaign.updateMany({ where, data });
      break;
    case "member":
      // The role they had when removed comes back as-is — no owner-count
      // rule to apply on restore, only on removal.
      await prisma.membership.updateMany({ where, data });
      break;
  }

  revalidatePath(`/app/${orgSlug}/trash`);
  return { error: null as string | null, message: t("restored") };
}
