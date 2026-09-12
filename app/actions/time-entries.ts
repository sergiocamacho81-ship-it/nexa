"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getCurrentUser } from "@/app/actions/organizations";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listTimeEntries(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.timeEntry.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: { job: { select: { id: true, title: true } } },
    orderBy: { date: "desc" },
  });
}

export type TimeEntryFormState = { error: string | null };

function parseHours(raw: string): number | null {
  const hours = Number(raw);
  if (!raw || Number.isNaN(hours) || hours <= 0) return null;
  return hours;
}

export async function createTimeEntry(
  _prevState: TimeEntryFormState,
  formData: FormData,
): Promise<TimeEntryFormState> {
  const t = await getTranslations("TimeEntries");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: t("errorUnauthorized") };
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  const hours = parseHours(String(formData.get("hours") ?? "").trim());
  const description = String(formData.get("description") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;
  const userIdRaw = String(formData.get("userId") ?? "").trim();

  if (!dateRaw) {
    return { error: t("errorDateRequired") };
  }
  if (hours === null) {
    return { error: t("errorInvalidHours") };
  }

  if (jobId) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, organizationId: organization.id, deletedAt: null },
    });
    if (!job) return { error: t("errorInvalidJob") };
  }

  let userId = user.id;
  if (userIdRaw) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: userIdRaw, organizationId: organization.id },
        deletedAt: null,
      },
    });
    if (!membership) return { error: t("errorInvalidUser") };
    userId = userIdRaw;
  }

  await prisma.timeEntry.create({
    data: {
      organizationId: organization.id,
      jobId,
      userId,
      date: new Date(dateRaw),
      hours,
      description: description || null,
    },
  });

  revalidatePath(`/app/${orgSlug}/time`);
  return { error: null };
}

export async function updateTimeEntry(
  _prevState: TimeEntryFormState,
  formData: FormData,
): Promise<TimeEntryFormState> {
  const t = await getTranslations("TimeEntries");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const timeEntryId = String(formData.get("timeEntryId") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const existing = await prisma.timeEntry.findFirst({
    where: { id: timeEntryId, organizationId: organization.id, deletedAt: null },
  });
  if (!existing) {
    return { error: t("errorNotFound") };
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  const hours = parseHours(String(formData.get("hours") ?? "").trim());
  const description = String(formData.get("description") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;
  const userIdRaw = String(formData.get("userId") ?? "").trim();

  if (!dateRaw) {
    return { error: t("errorDateRequired") };
  }
  if (hours === null) {
    return { error: t("errorInvalidHours") };
  }

  if (jobId) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, organizationId: organization.id, deletedAt: null },
    });
    if (!job) return { error: t("errorInvalidJob") };
  }

  let userId = existing.userId;
  if (userIdRaw) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: userIdRaw, organizationId: organization.id },
        deletedAt: null,
      },
    });
    if (!membership) return { error: t("errorInvalidUser") };
    userId = userIdRaw;
  }

  await prisma.timeEntry.update({
    where: { id: timeEntryId },
    data: { date: new Date(dateRaw), hours, description: description || null, jobId, userId },
  });

  revalidatePath(`/app/${orgSlug}/time`);
  return { error: null };
}

export async function deleteTimeEntry(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const timeEntryId = String(formData.get("timeEntryId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.timeEntry.updateMany({
    where: { id: timeEntryId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/time`);
}
