"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Lists the organizations the current user belongs to via Prisma.
// Relies on the caller already being authenticated (checked by proxy.ts and
// re-checked here) - this bypasses RLS by using the Prisma/service connection,
// so we must filter by user explicitly instead of relying on the database policy.
export async function listMyOrganizations() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id, deletedAt: null, organization: { deletedAt: null } },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    role: m.role,
  }));
}

// Organizations the user owned that are currently in the trash (soft-deleted
// within the retention window) — shown on /app so an Owner can restore one
// without needing to reach a now-inaccessible org-scoped page.
export async function listMyDeletedOrganizations() {
  const user = await getCurrentUser();
  if (!user) return [];

  const memberships = await prisma.membership.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      role: "OWNER",
      organization: { deletedAt: { not: null } },
    },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  return memberships
    .map((m) => m.organization)
    .filter((org) => org.deletedAt !== null)
    .map((org) => ({ id: org.id, name: org.name, slug: org.slug, deletedAt: org.deletedAt as Date }));
}

export async function deleteOrganization(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const organizationId = String(formData.get("organizationId") ?? "");
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId }, deletedAt: null },
  });
  if (!membership || membership.role !== "OWNER") {
    throw new Error("Only an OWNER can delete the organization.");
  }

  await prisma.organization.update({
    where: { id: organizationId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/app");
}

export async function restoreOrganization(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const organizationId = String(formData.get("organizationId") ?? "");
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId }, deletedAt: null },
  });
  if (!membership || membership.role !== "OWNER") {
    throw new Error("Only an OWNER can restore the organization.");
  }

  await prisma.organization.updateMany({
    where: { id: organizationId, deletedAt: { not: null } },
    data: { deletedAt: null },
  });

  revalidatePath("/app");
}

export type CreateOrganizationState = { error: string | null };

export async function createOrganization(
  _prevState: CreateOrganizationState,
  formData: FormData,
): Promise<CreateOrganizationState> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const t = await getTranslations("Organizations");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: t("errorNameRequired") };
  }

  const baseSlug = slugify(name);
  if (!baseSlug) {
    return { error: t("errorInvalidSlug") };
  }

  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await prisma.organization.create({
    data: {
      name,
      slug,
      memberships: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/app");
  return { error: null };
}
