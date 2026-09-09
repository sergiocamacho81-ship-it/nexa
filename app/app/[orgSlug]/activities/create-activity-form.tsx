"use client";

import { useActionState } from "react";
import { createActivity } from "@/app/actions/activities";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from "@/lib/activity-types";

type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };
type Deal = { id: string; title: string };

export function CreateActivityForm({
  orgSlug,
  contacts,
  companies,
  deals,
}: {
  orgSlug: string;
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
}) {
  const [state, action, isPending] = useActionState(createActivity, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" className="input" defaultValue="NOTE">
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {ACTIVITY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="contactId">Contacto</label>
          <select id="contactId" name="contactId" className="input" defaultValue="">
            <option value="">— Nenhum —</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName ?? ""}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="companyId">Empresa</label>
          <select id="companyId" name="companyId" className="input" defaultValue="">
            <option value="">— Nenhuma —</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dealId">Negócio</label>
          <select id="dealId" name="dealId" className="input" defaultValue="">
            <option value="">— Nenhum —</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="content">Descrição</label>
        <textarea id="content" name="content" required className="input" rows={3} />
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
        {isPending ? "A registar..." : "Registar atividade"}
      </button>
    </form>
  );
}
