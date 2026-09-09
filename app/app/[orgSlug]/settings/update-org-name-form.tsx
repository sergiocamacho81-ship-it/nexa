"use client";

import { useActionState } from "react";
import { updateOrganizationName } from "@/app/actions/settings";

export function UpdateOrgNameForm({
  orgSlug,
  currentName,
  disabled,
}: {
  orgSlug: string;
  currentName: string;
  disabled: boolean;
}) {
  const [state, action, isPending] = useActionState(updateOrganizationName, { error: null });

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          defaultValue={currentName}
          required
          disabled={disabled}
          className="input flex-1"
        />
        <button type="submit" disabled={isPending || disabled} className="btn btn-primary">
          {isPending ? "A guardar..." : "Guardar"}
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
