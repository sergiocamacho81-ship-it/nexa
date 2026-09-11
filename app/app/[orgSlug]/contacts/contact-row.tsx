"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { updateContact } from "@/app/actions/contacts";
import { DeleteContactButton } from "./delete-contact-button";
import { CONTACT_LANGUAGES } from "@/lib/contact-languages";
import { SWISS_CANTONS } from "@/lib/swiss-cantons";
import { LOCALE_LABELS } from "@/lib/i18n/config";

type Company = { id: string; name: string };
type Contact = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  company: { id: string; name: string } | null;
  preferredLanguage: string | null;
  city: string | null;
  canton: string | null;
};

export function ContactRow({
  orgSlug,
  contact,
  companies,
}: {
  orgSlug: string;
  contact: Contact;
  companies: Company[];
}) {
  const t = useTranslations("Contacts");
  const tCantons = useTranslations("Cantons");
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateContact, { error: null });

  if (!editing) {
    return (
      <tr>
        <td>
          {contact.firstName} {contact.lastName ?? ""}
        </td>
        <td className="text-muted">{contact.company?.name ?? "—"}</td>
        <td className="text-muted">{contact.email ?? "—"}</td>
        <td className="text-muted">{contact.phone ?? "—"}</td>
        <td className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </button>
          <DeleteContactButton orgSlug={orgSlug} contactId={contact.id} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={5}>
        <form
          action={(formData) => {
            action(formData);
          }}
          className="flex flex-col gap-2"
          style={{ padding: "8px 0" }}
        >
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="contactId" value={contact.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field">
              <label htmlFor={`firstName-${contact.id}`}>{t("firstName")}</label>
              <input
                id={`firstName-${contact.id}`}
                name="firstName"
                type="text"
                required
                defaultValue={contact.firstName}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`lastName-${contact.id}`}>{t("lastName")}</label>
              <input
                id={`lastName-${contact.id}`}
                name="lastName"
                type="text"
                defaultValue={contact.lastName ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`email-${contact.id}`}>{t("email")}</label>
              <input
                id={`email-${contact.id}`}
                name="email"
                type="email"
                defaultValue={contact.email ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`phone-${contact.id}`}>{t("phone")}</label>
              <input
                id={`phone-${contact.id}`}
                name="phone"
                type="tel"
                defaultValue={contact.phone ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`companyId-${contact.id}`}>{t("company")}</label>
              <select
                id={`companyId-${contact.id}`}
                name="companyId"
                className="input"
                defaultValue={contact.companyId ?? ""}
              >
                <option value="">{t("noCompany")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`preferredLanguage-${contact.id}`}>{t("preferredLanguage")}</label>
              <select
                id={`preferredLanguage-${contact.id}`}
                name="preferredLanguage"
                className="input"
                defaultValue={contact.preferredLanguage ?? ""}
              >
                <option value="">{t("noLanguage")}</option>
                {CONTACT_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LOCALE_LABELS[lang]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`city-${contact.id}`}>{t("city")}</label>
              <input
                id={`city-${contact.id}`}
                name="city"
                type="text"
                defaultValue={contact.city ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`canton-${contact.id}`}>{t("canton")}</label>
              <select
                id={`canton-${contact.id}`}
                name="canton"
                className="input"
                defaultValue={contact.canton ?? ""}
              >
                <option value="">{t("anyCanton")}</option>
                {SWISS_CANTONS.map((canton) => (
                  <option key={canton} value={canton}>
                    {tCantons(canton)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {state.error && (
            <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
              {state.error}
            </p>
          )}

          <div className="flex gap-2" style={{ alignSelf: "flex-start" }}>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? t("saving") : t("save")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t("cancel")}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
