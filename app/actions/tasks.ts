"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getCurrentUser } from "@/app/actions/organizations";
import { runAutomationsForTrigger } from "@/lib/automation/engine";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listTasks(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.task.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });
}

export type CreateTaskState = { error: string | null };

export async function createTask(
  _prevState: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const t = await getTranslations("Tasks");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: t("errorUnauthorized") };
  }

  const title = String(formData.get("title") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const dealId = String(formData.get("dealId") ?? "").trim();
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "").trim();

  if (!title) {
    return { error: t("errorTitleRequired") };
  }

  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId: organization.id, deletedAt: null },
    });
    if (!contact) return { error: t("errorInvalidContact") };
  }
  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id, deletedAt: null },
    });
    if (!company) return { error: t("errorInvalidCompany") };
  }
  if (dealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, organizationId: organization.id, deletedAt: null },
    });
    if (!deal) return { error: t("errorInvalidDeal") };
  }

  let assigneeId = user.id;
  if (assigneeIdRaw) {
    const assigneeMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: assigneeIdRaw, organizationId: organization.id },
        deletedAt: null,
      },
    });
    if (!assigneeMembership) return { error: t("errorInvalidAssignee") };
    assigneeId = assigneeIdRaw;
  }

  await prisma.task.create({
    data: {
      organizationId: organization.id,
      assigneeId,
      title,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      contactId: contactId || null,
      companyId: companyId || null,
      dealId: dealId || null,
    },
  });

  revalidatePath(`/app/${orgSlug}/tasks`);
  return { error: null };
}

export async function updateTask(
  _prevState: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const t = await getTranslations("Tasks");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, organizationId: organization.id, deletedAt: null },
  });
  if (!existing) {
    return { error: t("errorNotFound") };
  }

  const title = String(formData.get("title") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const dealId = String(formData.get("dealId") ?? "").trim();
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "").trim();

  if (!title) {
    return { error: t("errorTitleRequired") };
  }

  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId: organization.id, deletedAt: null },
    });
    if (!contact) return { error: t("errorInvalidContact") };
  }
  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id, deletedAt: null },
    });
    if (!company) return { error: t("errorInvalidCompany") };
  }
  if (dealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, organizationId: organization.id, deletedAt: null },
    });
    if (!deal) return { error: t("errorInvalidDeal") };
  }

  let assigneeId = existing.assigneeId;
  if (assigneeIdRaw) {
    const assigneeMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId: assigneeIdRaw, organizationId: organization.id },
        deletedAt: null,
      },
    });
    if (!assigneeMembership) return { error: t("errorInvalidAssignee") };
    assigneeId = assigneeIdRaw;
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      contactId: contactId || null,
      companyId: companyId || null,
      dealId: dealId || null,
      assigneeId,
    },
  });

  revalidatePath(`/app/${orgSlug}/tasks`);
  return { error: null };
}

export async function toggleTaskStatus(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const nextStatus = String(formData.get("status") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  if (nextStatus !== "PENDING" && nextStatus !== "COMPLETED") {
    throw new Error("Invalid status");
  }

  const task = await prisma.task.update({
    where: { id: taskId, organizationId: organization.id, deletedAt: null },
    data: { status: nextStatus },
  });

  if (nextStatus === "COMPLETED") {
    await runAutomationsForTrigger("task.completed", {
      organizationId: organization.id,
      contactId: task.contactId,
      companyId: task.companyId,
      dealId: task.dealId,
      taskId: task.id,
    });
  }

  revalidatePath(`/app/${orgSlug}/tasks`);
  revalidatePath(`/app/${orgSlug}`);
}

export async function deleteTask(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const taskId = String(formData.get("taskId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.task.updateMany({
    where: { id: taskId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/tasks`);
}
