"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createContact } from "@/app/actions/contacts";
import { CONTACT_LANGUAGES } from "@/lib/contact-languages";
import { SWISS_CANTONS } from "@/lib/swiss-cantons";
import { LOCALE_LABELS } from "@/lib/i18n/config";

type Company = { id: string; name: string };

const TOTAL_STEPS = 2;

export function CreateContactForm({
  orgSlug,
  companies,
}: {
  orgSlug: string;
  companies: Company[];
}) {
  const t = useTranslations("Contacts");
  const tCantons = useTranslations("Cantons");
  const [state, action, isPending] = useActionState(createContact, { error: null });
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />

      <p className="text-muted" style={{ fontSize: "11px", marginTop: "-4px" }}>
        {t("stepOf", { current: step, total: TOTAL_STEPS })} — {step === 1 ? t("step1Title") : t("step2Title")}
      </p>

      <div className="grid grid-cols-2 gap-2" style={{ display: step === 1 ? "grid" : "none" }}>
        <div className="field">
          <label htmlFor="firstName">{t("firstName")}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lastName">{t("lastName")}</label>
          <input id="lastName" name="lastName" type="text" className="input" />
        </div>
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" className="input" />
        </div>
        <div className="field">
          <label htmlFor="phone">{t("phone")}</label>
          <input id="phone" name="phone" type="tel" className="input" />
        </div>
        <div className="field">
          <label htmlFor="companyId">{t("company")}</label>
          <select id="companyId" name="companyId" className="input" defaultValue="">
            <option value="">{t("noCompany")}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ display: step === 2 ? "grid" : "none" }}>
        <div className="field">
          <label htmlFor="preferredLanguage">{t("preferredLanguage")}</label>
          <select id="preferredLanguage" name="preferredLanguage" className="input" defaultValue="">
            <option value="">{t("noLanguage")}</option>
            {CONTACT_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {LOCALE_LABELS[lang]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="city">{t("city")}</label>
          <input id="city" name="city" type="text" className="input" />
        </div>
        <div className="field">
          <label htmlFor="canton">{t("canton")}</label>
          <select id="canton" name="canton" className="input" defaultValue="">
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
        {step === 2 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
            {t("back")}
          </button>
        )}
        {step === 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!firstName.trim()}
            onClick={() => setStep(2)}
          >
            {t("next")}
          </button>
        ) : (
          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? t("adding") : t("add")}
          </button>
        )}
      </div>
    </form>
  );
}
