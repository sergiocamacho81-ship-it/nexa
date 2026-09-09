import nodemailer from "nodemailer";

export function getSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass: password },
  });
}

export function getSmtpFromAddress(): string | null {
  return process.env.SMTP_FROM ?? process.env.SMTP_USER ?? null;
}
