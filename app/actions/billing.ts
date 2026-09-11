"use server";

import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getCurrentUser } from "@/app/actions/organizations";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_ROLES } from "@/lib/membership-roles";

type Role = (typeof MEMBERSHIP_ROLES)[number];
const MANAGER_ROLES: Role[] = ["OWNER", "ADMIN"];

export type CheckoutState = { error: string | null; checkoutUrl?: string };

// Not wired to Stripe yet — no account exists to point this at. Everything
// around it (schema, limits, this gate) is ready; once STRIPE_SECRET_KEY
// (and a Price ID for the CHF 29/month Pro plan) exist, this becomes:
//   1. Ensure a Stripe Customer exists for the org (create + store
//      stripeCustomerId if not).
//   2. Create a Checkout Session (mode: "subscription", the Pro price,
//      success/cancel URLs back to Settings) and return its URL.
//   3. A webhook route (checkout.session.completed /
//      customer.subscription.updated/deleted) flips Organization.planTier
//      between PRO and FREE and keeps stripeSubscriptionId in sync — that
//      route doesn't exist yet either.
export async function createCheckoutSession(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const t = await getTranslations("Billing");
  const orgSlug = String(formData.get("orgSlug") ?? "");

  const user = await getCurrentUser();
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!user || !organization) return { error: t("upgradeNotConfigured") };

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: { userId: user.id, organizationId: organization.id },
      deletedAt: null,
    },
  });
  if (!membership || !MANAGER_ROLES.includes(membership.role)) {
    return { error: t("upgradeNotConfigured") };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { error: t("upgradeNotConfigured") };
  }

  // Unreachable until STRIPE_SECRET_KEY is set — left as an explicit
  // marker rather than silently succeeding with no real checkout.
  return { error: t("upgradeNotConfigured") };
}
