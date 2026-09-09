"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getSmtpTransport, getSmtpFromAddress } from "@/lib/smtp";
import { renderEmailHtml } from "@/lib/email-template";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listEmailMessages(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.emailMessage.findMany({
    where: { organizationId: organization.id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: { sentAt: "desc" },
  });
}

export type SendEmailState = { error: string | null };

export async function sendEmail(
  _prevState: SendEmailState,
  formData: FormData,
): Promise<SendEmailState> {
  const t = await getTranslations("Email");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const toAddress = String(formData.get("toAddress") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "").trim();
  const dealId = String(formData.get("dealId") ?? "").trim();

  if (!toAddress || !subject || !body) {
    return { error: t("errorRequiredFields") };
  }

  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId: organization.id },
    });
    if (!contact) return { error: t("errorInvalidContact") };
  }
  if (dealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, organizationId: organization.id },
    });
    if (!deal) return { error: t("errorInvalidDeal") };
  }

  const transport = getSmtpTransport();
  const fromAddress = getSmtpFromAddress();

  if (!transport || !fromAddress) {
    return { error: t("errorSmtpNotConfigured") };
  }

  let status: "SENT" | "FAILED" = "SENT";
  let error: string | null = null;

  try {
    await transport.sendMail({
      from: fromAddress,
      to: toAddress,
      subject,
      text: body,
      html: renderEmailHtml({ subject, body }),
    });
  } catch (err) {
    status = "FAILED";
    error = err instanceof Error ? err.message : "Unknown error while sending the email.";
  }

  await prisma.emailMessage.create({
    data: {
      organizationId: organization.id,
      contactId: contactId || null,
      dealId: dealId || null,
      fromAddress,
      toAddress,
      subject,
      body,
      status,
      error,
    },
  });

  revalidatePath(`/app/${orgSlug}/email`);
  return status === "FAILED" ? { error } : { error: null };
}
