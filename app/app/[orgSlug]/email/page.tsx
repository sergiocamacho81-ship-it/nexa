import { notFound } from "next/navigation";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listEmailMessages } from "@/app/actions/emails";
import { prisma } from "@/lib/prisma";
import { SendEmailForm } from "./send-email-form";

export default async function EmailPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const [messages, contacts, deals] = await Promise.all([
    listEmailMessages(orgSlug),
    prisma.contact.findMany({
      where: { organizationId: organization.id },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.deal.findMany({
      where: { organizationId: organization.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">Novo email</h6>
        <SendEmailForm orgSlug={orgSlug} contacts={contacts} deals={deals} />
      </section>

      <section>
        <h6 className="text-muted mb-3">Enviados ({messages.length})</h6>
        {messages.length === 0 ? (
          <p className="text-muted text-sm">Ainda não foram enviados emails.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <div key={message.id} className="card elev-sm">
                <div className="flex items-center justify-between">
                  <span
                    className={message.status === "SENT" ? "tag tag-accent" : "tag tag-outline"}
                  >
                    {message.status === "SENT" ? "Enviado" : "Falhou"}
                  </span>
                  <span className="card-meta">
                    {new Intl.DateTimeFormat("pt-PT", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(message.sentAt)}
                  </span>
                </div>
                <p className="card-title">{message.subject}</p>
                <p className="card-meta">Para: {message.toAddress}</p>
                <p className="card-body">{message.body}</p>
                {message.error && (
                  <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
                    {message.error}
                  </p>
                )}
                <div className="card-meta flex-wrap">
                  {message.contact && (
                    <span>
                      {message.contact.firstName} {message.contact.lastName ?? ""}
                    </span>
                  )}
                  {message.deal && <span>{message.deal.title}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
