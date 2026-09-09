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

  const items = [
    { href: `/app/${orgSlug}/contacts`, label: t("contacts") },
    { href: `/app/${orgSlug}/companies`, label: t("companies") },
    { href: `/app/${orgSlug}/deals`, label: t("deals") },
    { href: `/app/${orgSlug}/activities`, label: t("activities") },
    { href: `/app/${orgSlug}/tasks`, label: t("tasks") },
    { href: `/app/${orgSlug}/email`, label: t("email") },
    { href: `/app/${orgSlug}/automations`, label: t("automations") },
    { href: `/app/${orgSlug}/campaigns`, label: t("campaigns") },
    { href: `/app/${orgSlug}/segments`, label: t("segments") },
    { href: `/app/${orgSlug}/trash`, label: t("trash") },
    { href: `/app/${orgSlug}/settings`, label: t("settings") },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <OrgNav orgSlug={orgSlug} orgName={organization.name} items={items} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
