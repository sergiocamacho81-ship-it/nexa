"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { JOB_STATUSES } from "@/lib/job-statuses";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listJobs(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.job.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type JobFormState = { error: string | null };

export async function createJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const t = await getTranslations("Jobs");
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
  const status = JOB_STATUSES.includes(statusRaw as (typeof JOB_STATUSES)[number])
    ? (statusRaw as (typeof JOB_STATUSES)[number])
    : "SCHEDULED";

  const companyId = String(formData.get("companyId") ?? "").trim() || null;
  const contactId = String(formData.get("contactId") ?? "").trim() || null;
  const dealId = String(formData.get("dealId") ?? "").trim() || null;

  // Client-supplied ids are only ever used after confirming they belong to
  // this org — never trusted directly (same pattern as createDeal).
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

  await prisma.job.create({
    data: { organizationId: organization.id, title, status, companyId, contactId, dealId },
  });

  revalidatePath(`/app/${orgSlug}/jobs`);
  return { error: null };
}

export async function updateJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const t = await getTranslations("Jobs");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const jobId = String(formData.get("jobId") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const existing = await prisma.job.findFirst({
    where: { id: jobId, organizationId: organization.id, deletedAt: null },
  });
  if (!existing) {
    return { error: t("errorNotFound") };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: t("errorTitleRequired") };
  }

  const statusRaw = String(formData.get("status") ?? "");
  if (!JOB_STATUSES.includes(statusRaw as (typeof JOB_STATUSES)[number])) {
    return { error: t("errorInvalidStatus") };
  }
  const status = statusRaw as (typeof JOB_STATUSES)[number];

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

  await prisma.job.update({
    where: { id: jobId },
    data: { title, status, companyId, contactId },
  });

  revalidatePath(`/app/${orgSlug}/jobs`);
  return { error: null };
}

export async function deleteJob(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const jobId = String(formData.get("jobId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.job.updateMany({
    where: { id: jobId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/jobs`);
}
