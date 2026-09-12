import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { OrgNav } from "./org-nav";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Nav");

  // Primary: what a solo, time-poor user touches constantly. Secondary
  // (behind "More"): real but occasional — power-user/admin territory.
  const primaryItems = [
    { href: `/app/${orgSlug}/contacts`, label: t("contacts") },
    { href: `/app/${orgSlug}/deals`, label: t("deals") },
    { href: `/app/${orgSlug}/jobs`, label: t("jobs") },
    { href: `/app/${orgSlug}/tasks`, label: t("tasks") },
  ];
  const secondaryItems = [
    { href: `/app/${orgSlug}/companies`, label: t("companies") },
    { href: `/app/${orgSlug}/projects`, label: t("projects") },
    { href: `/app/${orgSlug}/calendar`, label: t("calendar") },
    { href: `/app/${orgSlug}/activities`, label: t("activities") },
    { href: `/app/${orgSlug}/email`, label: t("email") },
    { href: `/app/${orgSlug}/automations`, label: t("automations") },
    { href: `/app/${orgSlug}/campaigns`, label: t("campaigns") },
    { href: `/app/${orgSlug}/segments`, label: t("segments") },
    { href: `/app/${orgSlug}/products`, label: t("products") },
    { href: `/app/${orgSlug}/invoices`, label: t("invoices") },
    { href: `/app/${orgSlug}/trash`, label: t("trash") },
    { href: `/app/${orgSlug}/settings`, label: t("settings") },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <OrgNav
        orgSlug={orgSlug}
        orgName={organization.name}
        primaryItems={primaryItems}
        secondaryItems={secondaryItems}
        moreLabel={t("more")}
        menuLabel={t("menu")}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
