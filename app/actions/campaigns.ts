"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getSmtpTransport, getSmtpFromAddress } from "@/lib/smtp";
import { renderEmailHtml } from "@/lib/email-template";
import { buildContactWhere, parseSegmentFilters } from "@/lib/segments/filters";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listCampaigns(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.campaign.findMany({
    where: { organizationId: organization.id },
    include: { recipients: true, segment: { select: { id: true, name: true } } },
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
  const t = await getTranslations("Campaigns");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const segmentId = String(formData.get("segmentId") ?? "").trim();

  if (!name || !subject || !body) {
    return { error: t("errorRequiredFields") };
  }

  // No segment picked -> every contact with an email (the old default).
  // Segment picked -> its filters, narrowed to contacts with an email since
  // a campaign can't reach someone without one either way.
  let contactWhere = { organizationId: organization.id, email: { not: null } } as const;
  if (segmentId) {
    const segment = await prisma.segment.findFirst({
      where: { id: segmentId, organizationId: organization.id },
    });
    if (!segment) return { error: t("errorInvalidSegment") };
    const filters = parseSegmentFilters(segment.filters);
    contactWhere = {
      ...buildContactWhere(organization.id, filters),
      email: { not: null },
    } as typeof contactWhere;
  }

  const contactsWithEmail = await prisma.contact.findMany({
    where: contactWhere,
    select: { id: true },
  });

  if (contactsWithEmail.length === 0) {
    return { error: t("errorNoRecipients") };
  }

  await prisma.campaign.create({
    data: {
      organizationId: organization.id,
      segmentId: segmentId || null,
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
    throw new Error("Invalid campaign, or already sent.");
  }

  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "SENDING" } });

  const transport = getSmtpTransport(organization);
  const fromAddress = getSmtpFromAddress(organization);
  const html = renderEmailHtml({ subject: campaign.subject, body: campaign.body });

  for (const recipient of campaign.recipients) {
    if (!transport || !fromAddress || !recipient.contact.email) {
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: { status: "FAILED", error: "SMTP not configured, or the contact has no email.", sentAt: new Date() },
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
          error: err instanceof Error ? err.message : "Unknown error.",
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
