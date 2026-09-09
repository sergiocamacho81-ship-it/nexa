"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/organizations";
import { runAutomationsForTrigger } from "@/lib/automation/engine";
import { CONTACT_LANGUAGES } from "@/lib/contact-languages";
import { SWISS_CANTONS } from "@/lib/swiss-cantons";

// Resolves an organization by slug and verifies the current user is a
// member of it. Returns null if either check fails, so callers can 404/redirect.
// Both the org and the membership are soft-deletable, so both checks must
// exclude deleted rows — a removed member (or a trashed org) must lose
// access immediately, not just disappear from listings.
export async function getOrgForCurrentUser(orgSlug: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug, deletedAt: null },
  });
  if (!organization) return null;

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: { userId: user.id, organizationId: organization.id },
      deletedAt: null,
    },
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
    where: { organizationId: organization.id, deletedAt: null },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateContactState = { error: string | null };

// Shared by createContact and updateContact: parses+validates the fields
// that exist on both the (multi-step) create wizard and the edit form.
async function parseContactFields(
  formData: FormData,
  organizationId: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
): Promise<
  | { error: string }
  | {
      error: null;
      data: {
        firstName: string;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        companyId: string | null;
        preferredLanguage: (typeof CONTACT_LANGUAGES)[number] | null;
        city: string | null;
        canton: (typeof SWISS_CANTONS)[number] | null;
      };
    }
> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const preferredLanguageRaw = String(formData.get("preferredLanguage") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const cantonRaw = String(formData.get("canton") ?? "").trim();

  if (!firstName) {
    return { error: t("errorFirstNameRequired") };
  }

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId, deletedAt: null },
    });
    if (!company) {
      return { error: t("errorInvalidCompany") };
    }
  }

  const preferredLanguage = CONTACT_LANGUAGES.includes(
    preferredLanguageRaw as (typeof CONTACT_LANGUAGES)[number],
  )
    ? (preferredLanguageRaw as (typeof CONTACT_LANGUAGES)[number])
    : null;
  const canton = SWISS_CANTONS.includes(cantonRaw as (typeof SWISS_CANTONS)[number])
    ? (cantonRaw as (typeof SWISS_CANTONS)[number])
    : null;

  return {
    error: null,
    data: {
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
      companyId: companyId || null,
      preferredLanguage,
      city: city || null,
      canton,
    },
  };
}

export async function createContact(
  _prevState: CreateContactState,
  formData: FormData,
): Promise<CreateContactState> {
  const t = await getTranslations("Contacts");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const parsed = await parseContactFields(formData, organization.id, t);
  if (parsed.error !== null) return { error: parsed.error };

  const contact = await prisma.contact.create({
    data: { organizationId: organization.id, ...parsed.data },
  });

  await runAutomationsForTrigger("contact.created", {
    organizationId: organization.id,
    contactId: contact.id,
    companyId: contact.companyId,
  });

  revalidatePath(`/app/${orgSlug}/contacts`);
  return { error: null };
}

export async function updateContact(
  _prevState: CreateContactState,
  formData: FormData,
): Promise<CreateContactState> {
  const t = await getTranslations("Contacts");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const contactId = String(formData.get("contactId") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const existing = await prisma.contact.findFirst({
    where: { id: contactId, organizationId: organization.id, deletedAt: null },
  });
  if (!existing) {
    return { error: t("errorOrgNotFound") };
  }

  const parsed = await parseContactFields(formData, organization.id, t);
  if (parsed.error !== null) return { error: parsed.error };

  await prisma.contact.update({
    where: { id: contactId },
    data: parsed.data,
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

  await prisma.contact.updateMany({
    where: { id: contactId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/contacts`);
}

// Minimal CSV parser: comma-separated, optional double-quoted fields (with ""
// as an escaped quote inside a quoted field). Good enough for the flat,
// single-line-per-row contact export/import shape — not a general CSV parser.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (const line of lines) {
    if (line.trim() === "" && !inQuotes) continue;
    let i = 0;
    if (!inQuotes) {
      row = [];
      field = "";
    }
    while (i < line.length) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += ch;
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      field += ch;
      i++;
    }
    if (inQuotes) {
      field += "\n";
      continue;
    }
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export type ImportContactsState = {
  error: string | null;
  summary?: { created: number; failed: number; errors: string[] };
};

type ImportColumn =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "company"
  | "preferredLanguage"
  | "city"
  | "canton";

export async function importContacts(
  _prevState: ImportContactsState,
  formData: FormData,
): Promise<ImportContactsState> {
  const t = await getTranslations("Contacts");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: t("errorImportNoFile") };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { error: t("errorImportEmpty") };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const colIndex = (name: string) => header.indexOf(name.toLowerCase());
  const firstNameIdx = colIndex("firstName");
  if (firstNameIdx === -1) {
    return { error: t("errorImportMissingHeader", { column: "firstName" }) };
  }

  const companies = await prisma.company.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    select: { id: true, name: true },
  });
  const companyByName = new Map(companies.map((c) => [c.name.trim().toLowerCase(), c.id]));

  let created = 0;
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (cols.every((c) => c.trim() === "")) continue;
    const get = (name: ImportColumn) => {
      const idx = colIndex(name);
      return idx === -1 ? "" : (cols[idx] ?? "").trim();
    };

    const firstName = get("firstName");
    if (!firstName) {
      errors.push(t("errorImportRow", { row: r + 1, reason: t("errorFirstNameRequired") }));
      continue;
    }

    const companyName = get("company");
    const companyId = companyName ? (companyByName.get(companyName.toLowerCase()) ?? null) : null;

    const preferredLanguageRaw = get("preferredLanguage");
    const preferredLanguage = CONTACT_LANGUAGES.includes(
      preferredLanguageRaw as (typeof CONTACT_LANGUAGES)[number],
    )
      ? (preferredLanguageRaw as (typeof CONTACT_LANGUAGES)[number])
      : null;

    const cantonRaw = get("canton").toUpperCase();
    const canton = SWISS_CANTONS.includes(cantonRaw as (typeof SWISS_CANTONS)[number])
      ? (cantonRaw as (typeof SWISS_CANTONS)[number])
      : null;

    try {
      await prisma.contact.create({
        data: {
          organizationId: organization.id,
          firstName,
          lastName: get("lastName") || null,
          email: get("email") || null,
          phone: get("phone") || null,
          companyId,
          preferredLanguage,
          city: get("city") || null,
          canton,
        },
      });
      created++;
    } catch {
      errors.push(t("errorImportRow", { row: r + 1, reason: t("errorImportRowFailed") }));
    }
  }

  revalidatePath(`/app/${orgSlug}/contacts`);
  return { error: null, summary: { created, failed: errors.length, errors } };
}
