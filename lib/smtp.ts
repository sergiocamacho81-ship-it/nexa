import nodemailer from "nodemailer";

// Outbound email is configured per organization (Settings), not at the
// platform level — every org must set its own before Email/Campaigns work.
type OrgSmtpConfig = {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpFrom: string | null;
};

export function getSmtpTransport(org: OrgSmtpConfig) {
  const { smtpHost, smtpPort, smtpUser, smtpPassword } = org;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: org.smtpSecure,
    auth: { user: smtpUser, pass: smtpPassword },
  });
}

export function getSmtpFromAddress(org: OrgSmtpConfig): string | null {
  return org.smtpFrom ?? org.smtpUser ?? null;
}
