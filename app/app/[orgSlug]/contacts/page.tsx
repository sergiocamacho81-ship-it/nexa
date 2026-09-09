import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser, listContacts } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { CreateContactForm } from "./create-contact-form";
import { ContactRow } from "./contact-row";
import { ImportContactsButton } from "./import-contacts-button";

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
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-muted" style={{ margin: 0 }}>
            {t("heading", { count: contacts.length })}
          </h6>
          <ImportContactsButton orgSlug={orgSlug} />
        </div>
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
                <ContactRow key={contact.id} orgSlug={orgSlug} contact={contact} companies={companies} />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
