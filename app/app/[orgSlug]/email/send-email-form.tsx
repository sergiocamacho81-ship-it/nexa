"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendEmail } from "@/app/actions/emails";

type Contact = { id: string; firstName: string; lastName: string | null; email: string | null };
type Deal = { id: string; title: string };

export function SendEmailForm({
  orgSlug,
  contacts,
  deals,
}: {
  orgSlug: string;
  contacts: Contact[];
  deals: Deal[];
}) {
  const t = useTranslations("Email");
  const [state, action, isPending] = useActionState(sendEmail, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="toAddress">{t("to")}</label>
          <input id="toAddress" name="toAddress" type="email" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="contactId">{t("contact")}</label>
          <select
            id="contactId"
            name="contactId"
            className="input"
            defaultValue=""
            onChange={(e) => {
              const select = e.target;
              const option = select.selectedOptions[0];
              const email = option?.dataset.email;
              const toField = select.form?.elements.namedItem("toAddress") as HTMLInputElement | null;
              if (toField && email) toField.value = email;
            }}
          >
            <option value="">{t("noContact")}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id} data-email={contact.email ?? ""}>
                {contact.firstName} {contact.lastName ?? ""}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dealId">{t("deal")}</label>
          <select id="dealId" name="dealId" className="input" defaultValue="">
            <option value="">{t("noDeal")}</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="subject">{t("subject")}</label>
          <input id="subject" name="subject" type="text" required className="input" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="body">{t("message")}</label>
        <textarea id="body" name="body" required className="input" rows={5} />
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        {isPending ? t("sending") : t("send")}
      </button>
    </form>
  );
}
