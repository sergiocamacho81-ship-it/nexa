"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listCompanies(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.company.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateCompanyState = { error: string | null };

export async function createCompany(
  _prevState: CreateCompanyState,
  formData: FormData,
): Promise<CreateCompanyState> {
  const t = await getTranslations("Companies");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();

  if (!name) {
    return { error: t("errorNameRequired") };
  }

  await prisma.company.create({
    data: {
      organizationId: organization.id,
      name,
      domain: domain || null,
    },
  });

  revalidatePath(`/app/${orgSlug}/companies`);
  return { error: null };
}

export async function deleteCompany(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const companyId = String(formData.get("companyId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.company.deleteMany({
    where: { id: companyId, organizationId: organization.id },
  });

  revalidatePath(`/app/${orgSlug}/companies`);
}
