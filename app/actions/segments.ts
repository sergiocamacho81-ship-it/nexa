"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { buildContactWhere, parseSegmentFilters, type SegmentFilters } from "@/lib/segments/filters";
import { SWISS_CANTONS } from "@/lib/swiss-cantons";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listSegments(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  const segments = await prisma.segment.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    segments.map(async (segment) => {
      const filters = parseSegmentFilters(segment.filters);
      const count = await prisma.contact.count({
        where: buildContactWhere(organization.id, filters),
      });
      return { ...segment, filters, contactCount: count };
    }),
  );
}

// Resolves a segment's contacts right now (not a stored snapshot) — used by
// Campaigns to pick recipients. Returns [] if the segment doesn't belong to
// this org.
export async function getSegmentContacts(orgSlug: string, segmentId: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  const segment = await prisma.segment.findFirst({
    where: { id: segmentId, organizationId: organization.id },
  });
  if (!segment) return [];

  const filters = parseSegmentFilters(segment.filters);
  return prisma.contact.findMany({ where: buildContactWhere(organization.id, filters) });
}

export type CreateSegmentState = { error: string | null };

export async function createSegment(
  _prevState: CreateSegmentState,
  formData: FormData,
): Promise<CreateSegmentState> {
  const t = await getTranslations("Segments");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const hasEmailRaw = String(formData.get("hasEmail") ?? "");
  const createdAfter = String(formData.get("createdAfter") ?? "").trim();
  const createdBefore = String(formData.get("createdBefore") ?? "").trim();
  const cantonRaw = String(formData.get("canton") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!name) {
    return { error: t("errorNameRequired") };
  }

  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, organizationId: organization.id },
    });
    if (!company) return { error: t("errorInvalidCompany") };
  }

  const filters: SegmentFilters = {};
  if (companyId) filters.companyId = companyId;
  if (hasEmailRaw === "true") filters.hasEmail = true;
  if (hasEmailRaw === "false") filters.hasEmail = false;
  if (createdAfter) filters.createdAfter = createdAfter;
  if (createdBefore) filters.createdBefore = createdBefore;
  if (SWISS_CANTONS.includes(cantonRaw as (typeof SWISS_CANTONS)[number])) {
    filters.canton = cantonRaw as (typeof SWISS_CANTONS)[number];
  }
  if (city) filters.city = city;

  await prisma.segment.create({
    data: {
      organizationId: organization.id,
      name,
      description: description || null,
      filters,
    },
  });

  revalidatePath(`/app/${orgSlug}/segments`);
  return { error: null };
}

export async function deleteSegment(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const segmentId = String(formData.get("segmentId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.segment.deleteMany({
    where: { id: segmentId, organizationId: organization.id },
  });

  revalidatePath(`/app/${orgSlug}/segments`);
}
