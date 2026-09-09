"use client";

import { useActionState } from "react";
import { createTask } from "@/app/actions/tasks";

type Company = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string | null };
type Deal = { id: string; title: string };
type Member = { userId: string; email: string };

export function CreateTaskForm({
  orgSlug,
  contacts,
  companies,
  deals,
  members,
}: {
  orgSlug: string;
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  members: Member[];
}) {
  const [state, action, isPending] = useActionState(createTask, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field">
          <label htmlFor="title">Título</label>
          <input id="title" name="title" type="text" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="dueDate">Prazo</label>
          <input id="dueDate" name="dueDate" type="date" className="input" />
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
        <div className="field">
          <label htmlFor="assigneeId">Responsável</label>
          <select id="assigneeId" name="assigneeId" className="input" defaultValue="">
            <option value="">Eu</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.email}
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
        {isPending ? "A criar..." : "Adicionar tarefa"}
      </button>
    </form>
  );
}
