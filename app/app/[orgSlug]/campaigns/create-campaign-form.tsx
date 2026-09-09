"use client";

import { useActionState } from "react";
import { createCampaign } from "@/app/actions/campaigns";

export function CreateCampaignForm({ orgSlug }: { orgSlug: string }) {
  const [state, action, isPending] = useActionState(createCampaign, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="field">
        <label htmlFor="name">Nome da campanha</label>
        <input id="name" name="name" type="text" required className="input" />
      </div>
      <div className="field">
        <label htmlFor="subject">Assunto</label>
        <input id="subject" name="subject" type="text" required className="input" />
      </div>
      <div className="field">
        <label htmlFor="body">Mensagem</label>
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
        {isPending ? "A criar..." : "Criar rascunho"}
      </button>
    </form>
  );
}
