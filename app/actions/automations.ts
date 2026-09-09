"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { TRIGGER_TYPES, ACTION_TYPES } from "@/lib/automation/types";

// Both take orgSlug (not organizationId) and re-verify membership themselves
// — see note in app/actions/contacts.ts listContacts.
export async function listAutomations(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.automation.findMany({
    where: { organizationId: organization.id },
    include: { actions: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAutomationRuns(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.automationRun.findMany({
    where: { organizationId: organization.id },
    include: { automation: { select: { id: true, name: true } } },
    orderBy: { ranAt: "desc" },
    take: 30,
  });
}

export type CreateAutomationState = { error: string | null };

export async function createAutomation(
  _prevState: CreateAutomationState,
  formData: FormData,
): Promise<CreateAutomationState> {
  const t = await getTranslations("Automations");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const name = String(formData.get("name") ?? "").trim();
  const triggerType = String(formData.get("triggerType") ?? "");
  const actionType = String(formData.get("actionType") ?? "");
  const configKey = String(formData.get("configKey") ?? "");
  const configValue = String(formData.get("configValue") ?? "").trim();
  const configKey2 = String(formData.get("configKey2") ?? "");
  const configValue2 = String(formData.get("configValue2") ?? "").trim();

  if (!name) {
    return { error: t("errorNameRequired") };
  }
  if (!TRIGGER_TYPES.includes(triggerType as (typeof TRIGGER_TYPES)[number])) {
    return { error: t("errorInvalidTrigger") };
  }
  if (!ACTION_TYPES.includes(actionType as (typeof ACTION_TYPES)[number])) {
    return { error: t("errorInvalidAction") };
  }

  const actionConfig: Record<string, string> = {};
  if (configKey && configValue) actionConfig[configKey] = configValue;
  if (configKey2 && configValue2) actionConfig[configKey2] = configValue2;

  await prisma.automation.create({
    data: {
      organizationId: organization.id,
      name,
      triggerType,
      actions: {
        create: [{ order: 0, actionType, actionConfig }],
      },
    },
  });

  revalidatePath(`/app/${orgSlug}/automations`);
  return { error: null };
}

export async function toggleAutomationEnabled(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const automationId = String(formData.get("automationId") ?? "");
  const enabled = formData.get("enabled") === "true";

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.automation.updateMany({
    where: { id: automationId, organizationId: organization.id },
    data: { enabled },
  });

  revalidatePath(`/app/${orgSlug}/automations`);
}

export async function deleteAutomation(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const automationId = String(formData.get("automationId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.automation.deleteMany({
    where: { id: automationId, organizationId: organization.id },
  });

  revalidatePath(`/app/${orgSlug}/automations`);
}
