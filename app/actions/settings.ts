"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/organizations";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBERSHIP_ROLES } from "@/lib/membership-roles";

type Role = (typeof MEMBERSHIP_ROLES)[number];
const MANAGER_ROLES: Role[] = ["OWNER", "ADMIN"];

// Membership.userId has no FK to auth.users (see prisma/rls_policies_fase1_addendum.sql)
// so emails have to come from the Auth admin API, not a join.
async function getEmailsByUserId(userIds: string[]): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return new Map();
  const map = new Map<string, string>();
  for (const user of data.users) {
    if (userIds.includes(user.id) && user.email) map.set(user.id, user.email);
  }
  return map;
}

// Takes orgSlug (not organizationId) and re-verifies membership itself —
// this one returns other members' emails, so the check matters even more
// than usual. See note in app/actions/contacts.ts listContacts.
export async function listOrganizationMembersWithEmail(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  const t = await getTranslations("Settings");
  const memberships = await prisma.membership.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "asc" },
  });
  const emails = await getEmailsByUserId(memberships.map((m) => m.userId));
  return memberships.map((m) => ({
    userId: m.userId,
    email: emails.get(m.userId) ?? t("emailUnavailable"),
  }));
}

export async function getOrganizationSettings(orgSlug: string) {
  const user = await getCurrentUser();
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!user || !organization) return null;

  const t = await getTranslations("Settings");
  const memberships = await prisma.membership.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "asc" },
  });

  const emails = await getEmailsByUserId(memberships.map((m) => m.userId));
  const members = memberships.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    email: emails.get(m.userId) ?? t("emailUnavailable"),
    isCurrentUser: m.userId === user.id,
  }));

  const currentMembership = memberships.find((m) => m.userId === user.id);

  return {
    organization,
    members,
    currentUserRole: currentMembership?.role ?? "MEMBER",
  };
}

export type SettingsFormState = { error: string | null };

export async function updateOrganizationName(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const t = await getTranslations("Settings");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return { error: t("errorOrgNotFound") };
  if (!name) return { error: t("errorNameRequired") };

  await prisma.organization.update({ where: { id: organization.id }, data: { name } });
  revalidatePath(`/app/${orgSlug}/settings`);
  return { error: null };
}

export async function addMember(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const t = await getTranslations("Settings");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleRaw = String(formData.get("role") ?? "MEMBER");

  const user = await getCurrentUser();
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!user || !organization) return { error: t("errorOrgNotFound") };

  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
  });
  if (!membership || !MANAGER_ROLES.includes(membership.role)) {
    return { error: t("errorOnlyManagersAdd") };
  }

  if (!email) return { error: t("errorEmailRequired") };
  const role = MEMBERSHIP_ROLES.includes(roleRaw as Role) ? (roleRaw as Role) : "MEMBER";

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return { error: t("errorNoUsersFound") };
  const targetUser = data.users.find((u) => u.email?.toLowerCase() === email);
  if (!targetUser) {
    return { error: t("errorNoAccount") };
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: targetUser.id, organizationId: organization.id } },
  });
  if (existing) return { error: t("errorAlreadyMember") };

  await prisma.membership.create({
    data: { userId: targetUser.id, organizationId: organization.id, role },
  });

  revalidatePath(`/app/${orgSlug}/settings`);
  return { error: null };
}

async function assertCanManageMembers(organizationId: string) {
  const t = await getTranslations("Settings");
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId } },
  });
  if (!membership || !MANAGER_ROLES.includes(membership.role)) {
    throw new Error(t("errorOnlyManagersManage"));
  }
  return user;
}

export async function updateMemberRole(formData: FormData) {
  const t = await getTranslations("Settings");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const membershipId = String(formData.get("membershipId") ?? "");
  const roleRaw = String(formData.get("role") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");
  await assertCanManageMembers(organization.id);

  if (!MEMBERSHIP_ROLES.includes(roleRaw as Role)) throw new Error("Invalid role");

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: organization.id },
  });
  if (!target) throw new Error("Membership not found");

  if (target.role === "OWNER" && roleRaw !== "OWNER") {
    const ownerCount = await prisma.membership.count({
      where: { organizationId: organization.id, role: "OWNER" },
    });
    if (ownerCount <= 1) throw new Error(t("errorNeedsOneOwner"));
  }

  await prisma.membership.update({ where: { id: membershipId }, data: { role: roleRaw as Role } });
  revalidatePath(`/app/${orgSlug}/settings`);
}

export async function removeMember(formData: FormData) {
  const t = await getTranslations("Settings");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const membershipId = String(formData.get("membershipId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) throw new Error("Unauthorized");
  await assertCanManageMembers(organization.id);

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: organization.id },
  });
  if (!target) throw new Error("Membership not found");

  if (target.role === "OWNER") {
    const ownerCount = await prisma.membership.count({
      where: { organizationId: organization.id, role: "OWNER" },
    });
    if (ownerCount <= 1) throw new Error(t("errorNeedsOneOwner"));
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath(`/app/${orgSlug}/settings`);
}
