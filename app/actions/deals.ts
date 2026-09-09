"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { DEAL_STAGES } from "@/lib/deal-stages";
import { runAutomationsForTrigger } from "@/lib/automation/engine";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listDeals(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.deal.findMany({
    where: { organizationId: organization.id },
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
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: "Organização não encontrada." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const valueRaw = String(formData.get("value") ?? "").trim();
  const stageRaw = String(formData.get("stage") ?? "LEAD");
  const companyId = String(formData.get("companyId") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "").trim();

  if (!title) {
    return { error: "O título do negócio é obrigatório." };
  }

  const stage = DEAL_STAGES.includes(stageRaw as (typeof DEAL_STAGES)[number])
    ? (stageRaw as (typeof DEAL_STAGES)[number])
    : "LEAD";

  const value = valueRaw ? Number(valueRaw) : null;
  if (valueRaw && Number.isNaN(value)) {
    return { error: "Valor inválido." };
  }

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id },
    });
    if (!company) return { error: "Empresa inválida." };
  }

  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId: organization.id },
    });
    if (!contact) return { error: "Contacto inválido." };
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
    where: { id: dealId, organizationId: organization.id },
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

  await prisma.deal.deleteMany({
    where: { id: dealId, organizationId: organization.id },
  });

  revalidatePath(`/app/${orgSlug}/deals`);
}
