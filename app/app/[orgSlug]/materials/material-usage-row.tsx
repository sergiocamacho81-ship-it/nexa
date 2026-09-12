"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { updateMaterialUsage } from "@/app/actions/material-usages";
import { DeleteMaterialUsageButton } from "./delete-material-usage-button";

type MaterialUsage = {
  id: string;
  date: Date;
  description: string;
  quantity: number;
  unit: string | null;
  unitCost: number | null;
  jobId: string | null;
  job: { id: string; title: string } | null;
};
type Job = { id: string; title: string };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function MaterialUsageRow({
  orgSlug,
  entry,
  jobs,
}: {
  orgSlug: string;
  entry: MaterialUsage;
  jobs: Job[];
}) {
  const t = useTranslations("Materials");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [state, action, isPending] = useActionState(updateMaterialUsage, { error: null });

  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "CHF" });
  const totalCost = entry.unitCost !== null ? entry.unitCost * entry.quantity : null;

  if (!editing) {
    return (
      <tr>
        <td className="text-muted">{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(entry.date)}</td>
        <td>{entry.description}</td>
        <td className="text-muted">
          {entry.quantity} {entry.unit ?? ""}
        </td>
        <td className="text-muted">{totalCost !== null ? currencyFormatter.format(totalCost) : "—"}</td>
        <td className="text-muted">{entry.job ? entry.job.title : "—"}</td>
        <td className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("edit")}
          </button>
          <DeleteMaterialUsageButton orgSlug={orgSlug} materialUsageId={entry.id} />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={6}>
        <form action={action} className="flex flex-col gap-2" style={{ padding: "8px 0" }}>
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="materialUsageId" value={entry.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="field">
              <label htmlFor={`date-${entry.id}`}>{t("date")}</label>
              <input
                id={`date-${entry.id}`}
                name="date"
                type="date"
                required
                defaultValue={toDateInputValue(entry.date)}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`jobId-${entry.id}`}>{t("job")}</label>
              <select
                id={`jobId-${entry.id}`}
                name="jobId"
                className="input"
                defaultValue={entry.jobId ?? ""}
              >
                <option value="">{t("noJob")}</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor={`description-${entry.id}`}>{t("description")}</label>
              <input
                id={`description-${entry.id}`}
                name="description"
                type="text"
                required
                defaultValue={entry.description}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`quantity-${entry.id}`}>{t("quantity")}</label>
              <input
                id={`quantity-${entry.id}`}
                name="quantity"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={entry.quantity}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`unit-${entry.id}`}>{t("unit")}</label>
              <input
                id={`unit-${entry.id}`}
                name="unit"
                type="text"
                defaultValue={entry.unit ?? ""}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor={`unitCost-${entry.id}`}>{t("unitCost")}</label>
              <input
                id={`unitCost-${entry.id}`}
                name="unitCost"
                type="number"
                step="0.01"
                min="0"
                defaultValue={entry.unitCost ?? ""}
                className="input"
              />
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
