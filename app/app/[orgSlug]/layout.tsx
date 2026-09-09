import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <div className="flex flex-1 flex-col">
      <nav className="nav" style={{ borderBottomWidth: "1px" }}>
        <Link href={`/app/${orgSlug}`} className="nav-brand" style={{ fontSize: "14px" }}>
          {organization.name}
        </Link>
        <Link href={`/app/${orgSlug}/contacts`}>Contactos</Link>
        <Link href={`/app/${orgSlug}/companies`}>Empresas</Link>
        <Link href={`/app/${orgSlug}/deals`}>Negócios</Link>
        <Link href={`/app/${orgSlug}/activities`}>Atividades</Link>
        <Link href={`/app/${orgSlug}/tasks`}>Tarefas</Link>
        <Link href={`/app/${orgSlug}/email`}>Email</Link>
        <Link href={`/app/${orgSlug}/automations`}>Automações</Link>
        <Link href={`/app/${orgSlug}/campaigns`}>Campanhas</Link>
        <Link href={`/app/${orgSlug}/settings`}>Definições</Link>
      </nav>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
