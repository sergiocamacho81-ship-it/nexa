import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";

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

  return (
    <div className="flex flex-1 flex-col">
      <nav className="nav" style={{ borderBottomWidth: "1px" }}>
        <Link href={`/app/${orgSlug}`} className="nav-brand" style={{ fontSize: "14px" }}>
          {organization.name}
        </Link>
        <Link href={`/app/${orgSlug}/contacts`}>{t("contacts")}</Link>
        <Link href={`/app/${orgSlug}/companies`}>{t("companies")}</Link>
        <Link href={`/app/${orgSlug}/deals`}>{t("deals")}</Link>
        <Link href={`/app/${orgSlug}/activities`}>{t("activities")}</Link>
        <Link href={`/app/${orgSlug}/tasks`}>{t("tasks")}</Link>
        <Link href={`/app/${orgSlug}/email`}>{t("email")}</Link>
        <Link href={`/app/${orgSlug}/automations`}>{t("automations")}</Link>
        <Link href={`/app/${orgSlug}/campaigns`}>{t("campaigns")}</Link>
        <Link href={`/app/${orgSlug}/segments`}>{t("segments")}</Link>
        <Link href={`/app/${orgSlug}/settings`}>{t("settings")}</Link>
      </nav>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
