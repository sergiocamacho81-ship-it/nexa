"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getOrgForCurrentUser } from "@/app/actions/contacts";

// Takes orgSlug (not organizationId) and re-verifies membership itself — see
// note in app/actions/contacts.ts listContacts.
export async function listProducts(orgSlug: string) {
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) return [];

  return prisma.product.findMany({
    where: { organizationId: organization.id, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export type ProductFormState = { error: string | null };

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const t = await getTranslations("Products");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const unitPriceRaw = String(formData.get("unitPrice") ?? "").trim();

  if (!name) {
    return { error: t("errorNameRequired") };
  }

  const unitPrice = Number(unitPriceRaw);
  if (!unitPriceRaw || Number.isNaN(unitPrice) || unitPrice < 0) {
    return { error: t("errorInvalidPrice") };
  }

  await prisma.product.create({
    data: {
      organizationId: organization.id,
      name,
      description: description || null,
      unit: unit || null,
      unitPrice,
    },
  });

  revalidatePath(`/app/${orgSlug}/products`);
  return { error: null };
}

export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const t = await getTranslations("Products");
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    return { error: t("errorOrgNotFound") };
  }

  const existing = await prisma.product.findFirst({
    where: { id: productId, organizationId: organization.id, deletedAt: null },
  });
  if (!existing) {
    return { error: t("errorOrgNotFound") };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const unitPriceRaw = String(formData.get("unitPrice") ?? "").trim();

  if (!name) {
    return { error: t("errorNameRequired") };
  }

  const unitPrice = Number(unitPriceRaw);
  if (!unitPriceRaw || Number.isNaN(unitPrice) || unitPrice < 0) {
    return { error: t("errorInvalidPrice") };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { name, description: description || null, unit: unit || null, unitPrice },
  });

  revalidatePath(`/app/${orgSlug}/products`);
  return { error: null };
}

export async function deleteProduct(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const productId = String(formData.get("productId") ?? "");

  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.product.updateMany({
    where: { id: productId, organizationId: organization.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/${orgSlug}/products`);
}
