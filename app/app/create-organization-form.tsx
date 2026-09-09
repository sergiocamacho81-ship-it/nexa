"use client";

import { useActionState } from "react";
import { createOrganization } from "@/app/actions/organizations";

export function CreateOrganizationForm() {
  const [state, action, isPending] = useActionState(createOrganization, {
    error: null,
  });

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="Nome da organização"
          required
          className="input flex-1"
        />
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending ? "A criar..." : "Criar"}
        </button>
      </div>
      {state.error && (
        <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>
          {state.error}
        </p>
      )}
    </form>
  );
}
