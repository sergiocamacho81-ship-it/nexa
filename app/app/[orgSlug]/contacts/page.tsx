import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser, listContacts } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { CreateContactForm } from "./create-contact-form";
import { DeleteContactButton } from "./delete-contact-button";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Contacts");

  const [contacts, companies] = await Promise.all([listContacts(orgSlug), listCompanies(orgSlug)]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newContact")}</h6>
        <CreateContactForm orgSlug={orgSlug} companies={companies} />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: contacts.length })}</h6>
        {contacts.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t("tableName")}</th>
                <th>{t("tableCompany")}</th>
                <th>{t("tableEmail")}</th>
                <th>{t("tablePhone")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    {contact.firstName} {contact.lastName ?? ""}
                  </td>
                  <td className="text-muted">{contact.company?.name ?? "—"}</td>
                  <td className="text-muted">{contact.email ?? "—"}</td>
                  <td className="text-muted">{contact.phone ?? "—"}</td>
                  <td>
                    <DeleteContactButton orgSlug={orgSlug} contactId={contact.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
