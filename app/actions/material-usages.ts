"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listMaterialUsages(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.materialUsage.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    include: { job: { select: { id: true, title: true } } },
    orderBy: { date: "desc" },
  });
}

export type MaterialUsageFormState = { error: string | null };

function parsePositiveDecimal(raw: string): number | null {
  const value = Number(raw);
  if (!raw || Number.isNaN(value) || value <= 0) return null;
  return value;
}

export async function createMaterialUsage(
  _prevState: MaterialUsageFormState,
  formData: FormData,
): Promise<MaterialUsageFormState> {
  const t = await getTranslations("Materials");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const quantity = parsePositiveDecimal(String(formData.get("quantity") ?? "").trim());
  const unit = String(formData.get("unit") ?? "").trim();
  const unitCostRaw = String(formData.get("unitCost") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;

  if (!dateRaw) {
    return { error: t("errorDateRequired") };
  }
  if (!description) {
    return { error: t("errorDescriptionRequired") };
  }
  if (quantity === null) {
    return { error: t("errorInvalidQuantity") };
  }
  let unitCost: number | null = null;
  if (unitCostRaw) {
    const parsed = Number(unitCostRaw);
    if (Number.isNaN(parsed) || parsed < 0) return { error: t("errorInvalidUnitCost") };
    unitCost = parsed;
  }

  let validProductId: string | null = null;
  if (productId) {
    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId: organization.id, deletedAt: null },
    });
    if (!product) return { error: t("errorInvalidProduct") };
    validProductId = product.id;
  }

  if (jobId) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, organizationId: organization.id, deletedAt: null },
    });
    if (!job) return { error: t("errorInvalidJob") };
  }

  await prisma.materialUsage.create({
    data: {
      organizationId: organization.id,
      jobId,
      productId: validProductId,
      description,
      quantity,
      unit: unit || null,
      unitCost,
      date: new Date(dateRaw),
    },
  });

  revalidatePath(`/app/${orgSlug}/materials`);
  return { error: null };
}

export async function updateMaterialUsage(
  _prevState: MaterialUsageFormState,
  formData: FormData,
): Promise<MaterialUsageFormState> {
  const t = await getTranslations("Materials");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const materialUsageId = String(formData.get("materialUsageId") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const existing = await prisma.materialUsage.findFirst({
    where: { id: materialUsageId, organizationId: organization.id, deletedAt: null },
  });
  if (!existing) {
    return { error: t("errorNotFound") };
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantity = parsePositiveDecimal(String(formData.get("quantity") ?? "").trim());
  const unit = String(formData.get("unit") ?? "").trim();
  const unitCostRaw = String(formData.get("unitCost") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;

  if (!dateRaw) {
    return { error: t("errorDateRequired") };
  }
  if (!description) {
    return { error: t("errorDescriptionRequired") };
  }
  if (quantity === null) {
    return { error: t("errorInvalidQuantity") };
  }
  let unitCost: number | null = null;
  if (unitCostRaw) {
    const parsed = Number(unitCostRaw);
    if (Number.isNaN(parsed) || parsed < 0) return { error: t("errorInvalidUnitCost") };
    unitCost = parsed;
  }

  if (jobId) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, organizationId: organization.id, deletedAt: null },
    });
    if (!job) return { error: t("errorInvalidJob") };
  }

  await prisma.materialUsage.update({
    where: { id: materialUsageId },
    data: { date: new Date(dateRaw), description, quantity, unit: unit || null, unitCost, jobId },
  });

  revalidatePath(`/app/${orgSlug}/materials`);
  return { error: null };
}

export async function deleteMaterialUsage(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const materialUsageId = String(formData.get("materialUsageId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.materialUsage.updateMany({
    where: { id: materialUsageId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/materials`);
}
