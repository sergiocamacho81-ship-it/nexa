"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/organizations";
import { runAutomationsForTrigger } from "@/lib/automation/engine";

// Resolves an organization by slug and verifies the current user is a
// member of it. Returns null if either check fails, so callers can 404/redirect.
export async function getOrgForCurrentUser(orgSlug: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!organization) return null;

  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
  });
  if (!membership) return null;

  return organization;
}

// Takes orgSlug (not organizationId) and re-verifies membership itself: any
// exported function in a "use server" file is reachable via direct POST, so
// it cannot trust an id handed to it by the caller. See Next.js docs on
// Server Functions security.
export async function listContacts(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.contact.findMany({
    where: { organizationId: organization.id },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateContactState = { error: string | null };

export async function createContact(
  _prevState: CreateContactState,
  formData: FormData,
): Promise<CreateContactState> {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: "Organização não encontrada." };
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();

  if (!firstName) {
    return { error: "O primeiro nome é obrigatório." };
  }

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id },
    });
    if (!company) {
      return { error: "Empresa inválida." };
    }
  }

  const contact = await prisma.contact.create({
    data: {
      organizationId: organization.id,
      companyId: companyId || null,
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
    },
  });

  await runAutomationsForTrigger("contact.created", {
    organizationId: organization.id,
    contactId: contact.id,
    companyId: contact.companyId,
  });

  revalidatePath(`/app/${orgSlug}/contacts`);
  return { error: null };
}

export async function deleteContact(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const contactId = String(formData.get("contactId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.contact.deleteMany({
    where: { id: contactId, organizationId: organization.id },
  });

  revalidatePath(`/app/${orgSlug}/contacts`);
}
