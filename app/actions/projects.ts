"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { PROJECT_STATUSES } from "@/lib/project-statuses";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listProjects(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.project.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type ProjectFormState = { error: string | null };

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const t = await getTranslations("Projects");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: t("errorTitleRequired") };
  }

  const statusRaw = String(formData.get("status") ?? "");
  const status = PROJECT_STATUSES.includes(statusRaw as (typeof PROJECT_STATUSES)[number])
    ? (statusRaw as (typeof PROJECT_STATUSES)[number])
    : "PLANNED";

  const companyId = String(formData.get("companyId") ?? "").trim() || null;
  const contactId = String(formData.get("contactId") ?? "").trim() || null;
  const dealId = String(formData.get("dealId") ?? "").trim() || null;

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id, deletedAt: null },
    });
    if (!company) return { error: t("errorInvalidCompany") };
  }
  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId: organization.id, deletedAt: null },
    });
    if (!contact) return { error: t("errorInvalidContact") };
  }
  if (dealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, organizationId: organization.id, deletedAt: null },
    });
    if (!deal) return { error: t("errorInvalidDeal") };
  }

  await prisma.project.create({
    data: { organizationId: organization.id, title, status, companyId, contactId, dealId },
  });

  revalidatePath(`/app/${orgSlug}/projects`);
  return { error: null };
}

export async function updateProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const t = await getTranslations("Projects");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const existing = await prisma.project.findFirst({
    where: { id: projectId, organizationId: organization.id, deletedAt: null },
  });
  if (!existing) {
    return { error: t("errorNotFound") };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: t("errorTitleRequired") };
  }

  const statusRaw = String(formData.get("status") ?? "");
  if (!PROJECT_STATUSES.includes(statusRaw as (typeof PROJECT_STATUSES)[number])) {
    return { error: t("errorInvalidStatus") };
  }
  const status = statusRaw as (typeof PROJECT_STATUSES)[number];

  const companyId = String(formData.get("companyId") ?? "").trim() || null;
  const contactId = String(formData.get("contactId") ?? "").trim() || null;

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id, deletedAt: null },
    });
    if (!company) return { error: t("errorInvalidCompany") };
  }
  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId: organization.id, deletedAt: null },
    });
    if (!contact) return { error: t("errorInvalidContact") };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { title, status, companyId, contactId },
  });

  revalidatePath(`/app/${orgSlug}/projects`);
  return { error: null };
}

export async function deleteProject(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.project.updateMany({
    where: { id: projectId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/projects`);
}
