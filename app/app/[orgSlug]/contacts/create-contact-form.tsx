"use client";

import { useActionState } from "react";
import { createContact } from "@/app/actions/contacts";

type Company = { id: string; name: string };

export function CreateContactForm({
  orgSlug,
  companies,
}: {
  orgSlug: string;
  companies: Company[];
}) {
  const [state, action, isPending] = useActionState(createContact, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="firstName">Primeiro nome</label>
          <input id="firstName" name="firstName" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="lastName">Último nome</label>
          <input id="lastName" name="lastName" type="text" className="input" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefone</label>
          <input id="phone" name="phone" type="tel" className="input" />
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
      </div>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
        {isPending ? "A criar..." : "Adicionar contacto"}
      </button>
    </form>
  );
}
