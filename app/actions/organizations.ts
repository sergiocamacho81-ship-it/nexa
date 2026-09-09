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
    where: { userId: user.id },
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
