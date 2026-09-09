"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getSmtpTransport, getSmtpFromAddress } from "@/lib/smtp";
import { renderEmailHtml } from "@/lib/email-template";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listCampaigns(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.campaign.findMany({
    where: { organizationId: organization.id },
    include: { recipients: true },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateCampaignState = { error: string | null };

// Creates a campaign in DRAFT status and snapshots every contact with an
// email address in the org as a PENDING recipient. Sending happens
// separately (sendCampaign), so a draft can be reviewed before going out.
export async function createCampaign(
  _prevState: CreateCampaignState,
  formData: FormData,
): Promise<CreateCampaignState> {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: "Organização não encontrada." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!name || !subject || !body) {
    return { error: "Nome, assunto e corpo são obrigatórios." };
  }

  const contactsWithEmail = await prisma.contact.findMany({
    where: { organizationId: organization.id, email: { not: null } },
    select: { id: true },
  });

  if (contactsWithEmail.length === 0) {
    return { error: "Não há contactos com email nesta organização." };
  }

  await prisma.campaign.create({
    data: {
      organizationId: organization.id,
      name,
      subject,
      body,
      recipients: {
        create: contactsWithEmail.map((contact) => ({ contactId: contact.id })),
      },
    },
  });

  revalidatePath(`/app/${orgSlug}/campaigns`);
  return { error: null };
}

export async function sendCampaign(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, organizationId: organization.id },
    include: { recipients: { include: { contact: true } } },
  });
  if (!campaign || campaign.status !== "DRAFT") {
    throw new Error("Campanha inválida ou já enviada.");
  }

  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "SENDING" } });

  const transport = getSmtpTransport();
  const fromAddress = getSmtpFromAddress();
  const html = renderEmailHtml({ subject: campaign.subject, body: campaign.body });

  for (const recipient of campaign.recipients) {
    if (!transport || !fromAddress || !recipient.contact.email) {
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: { status: "FAILED", error: "SMTP não configurado ou contacto sem email.", sentAt: new Date() },
      });
      continue;
    }

    try {
      await transport.sendMail({
        from: fromAddress,
        to: recipient.contact.email,
        subject: campaign.subject,
        text: campaign.body,
        html,
      });
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (err) {
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: "FAILED",
          error: err instanceof Error ? err.message : "Erro desconhecido.",
          sentAt: new Date(),
        },
      });
    }
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "SENT", sentAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/campaigns`);
}

export async function deleteCampaign(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.campaign.deleteMany({
    where: { id: campaignId, organizationId: organization.id },
  });

  revalidatePath(`/app/${orgSlug}/campaigns`);
}
