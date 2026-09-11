"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { DEAL_STAGES } from "@/lib/deal-stages";
import { runAutomationsForTrigger } from "@/lib/automation/engine";
import { checkPlanLimit } from "@/lib/plan-limits";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listDeals(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.deal.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateDealState = { error: string | null };

export async function createDeal(
  _prevState: CreateDealState,
  formData: FormData,
): Promise<CreateDealState> {
  const t = await getTranslations("Deals");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const title = String(formData.get("title") ?? "").trim();
  const valueRaw = String(formData.get("value") ?? "").trim();
  const stageRaw = String(formData.get("stage") ?? "LEAD");
  const companyId = String(formData.get("companyId") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "").trim();

  if (!title) {
    return { error: t("errorTitleRequired") };
  }

  const stage = DEAL_STAGES.includes(stageRaw as (typeof DEAL_STAGES)[number])
    ? (stageRaw as (typeof DEAL_STAGES)[number])
    : "LEAD";

  // Only a deal actually landing in an "active" stage counts toward the
  // cap — creating one straight into Won/Lost (rare, but the form allows
  // it) shouldn't be blocked by it.
  if (stage !== "WON" && stage !== "LOST") {
    const limitCheck = await checkPlanLimit(organization, "activeDeals");
    if (limitCheck.limited) {
      return { error: t("errorPlanLimit", { limit: String(limitCheck.limit) }) };
    }
  }

  const value = valueRaw ? Number(valueRaw) : null;
  if (valueRaw && Number.isNaN(value)) {
    return { error: t("errorInvalidValue") };
  }

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

  await prisma.deal.create({
    data: {
      organizationId: organization.id,
      title,
      value,
      stage,
      companyId: companyId || null,
      contactId: contactId || null,
    },
  });

  revalidatePath(`/app/${orgSlug}/deals`);
  return { error: null };
}

export async function updateDealStage(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const dealId = String(formData.get("dealId") ?? "");
  const stageRaw = String(formData.get("stage") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  if (!DEAL_STAGES.includes(stageRaw as (typeof DEAL_STAGES)[number])) {
    throw new Error("Invalid stage");
  }

  const deal = await prisma.deal.update({
    where: { id: dealId, organizationId: organization.id, deletedAt: null },
    data: { stage: stageRaw as (typeof DEAL_STAGES)[number] },
  });

  await runAutomationsForTrigger("deal.stage_changed", {
    organizationId: organization.id,
    dealId: deal.id,
    contactId: deal.contactId,
    companyId: deal.companyId,
    stage: deal.stage,
  });

  revalidatePath(`/app/${orgSlug}/deals`);
}

export async function deleteDeal(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const dealId = String(formData.get("dealId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.deal.updateMany({
    where: { id: dealId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/deals`);
}
