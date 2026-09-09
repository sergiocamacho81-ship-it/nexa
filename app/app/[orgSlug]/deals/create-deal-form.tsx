"use client";

import { useActionState } from "react";
import { createDeal } from "@/app/actions/deals";
import { DEAL_STAGES, DEAL_STAGE_LABELS } from "@/lib/deal-stages";

type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };

export function CreateDealForm({
  orgSlug,
  companies,
  contacts,
}: {
  orgSlug: string;
  companies: Company[];
  contacts: Contact[];
}) {
  const [state, action, isPending] = useActionState(createDeal, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="title">Título</label>
          <input id="title" name="title" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="value">Valor (EUR)</label>
          <input id="value" name="value" type="number" step="0.01" min="0" className="input" />
        </div>
        <div className="field">
          <label htmlFor="stage">Estágio</label>
          <select id="stage" name="stage" className="input" defaultValue="LEAD">
            {DEAL_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {DEAL_STAGE_LABELS[stage]}
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
        {isPending ? "A criar..." : "Adicionar negócio"}
      </button>
    </form>
  );
}
