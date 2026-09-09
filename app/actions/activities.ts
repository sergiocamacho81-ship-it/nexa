"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { ACTIVITY_TYPES } from "@/lib/activity-types";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listActivities(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.activity.findMany({
    where: { organizationId: organization.id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: { occurredAt: "desc" },
  });
}

export type CreateActivityState = { error: string | null };

export async function createActivity(
  _prevState: CreateActivityState,
  formData: FormData,
): Promise<CreateActivityState> {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: "Organização não encontrada." };
  }

  const typeRaw = String(formData.get("type") ?? "NOTE");
  const content = String(formData.get("content") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const dealId = String(formData.get("dealId") ?? "").trim();

  if (!content) {
    return { error: "A descrição é obrigatória." };
  }

  const type = ACTIVITY_TYPES.includes(typeRaw as (typeof ACTIVITY_TYPES)[number])
    ? (typeRaw as (typeof ACTIVITY_TYPES)[number])
    : "NOTE";

  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId: organization.id },
    });
    if (!contact) return { error: "Contacto inválido." };
  }
  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id },
    });
    if (!company) return { error: "Empresa inválida." };
  }
  if (dealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, organizationId: organization.id },
    });
    if (!deal) return { error: "Negócio inválido." };
  }

  await prisma.activity.create({
    data: {
      organizationId: organization.id,
      type,
      content,
      contactId: contactId || null,
      companyId: companyId || null,
      dealId: dealId || null,
    },
  });

  revalidatePath(`/app/${orgSlug}/activities`);
  return { error: null };
}

export async function deleteActivity(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const activityId = String(formData.get("activityId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.activity.deleteMany({
    where: { id: activityId, organizationId: organization.id },
  });

  revalidatePath(`/app/${orgSlug}/activities`);
}
