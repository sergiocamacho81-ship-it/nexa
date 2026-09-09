import { notFound } from "next/navigation";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listAutomations, listAutomationRuns } from "@/app/actions/automations";
import { TRIGGER_TYPE_LABELS, ACTION_TYPE_LABELS, type TriggerType, type ActionType } from "@/lib/automation/types";
import { CreateAutomationForm } from "./create-automation-form";
import { AutomationToggle } from "./automation-toggle";
import { DeleteAutomationButton } from "./delete-automation-button";

export default async function AutomationsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const [automations, runs] = await Promise.all([
    listAutomations(orgSlug),
    listAutomationRuns(orgSlug),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">Nova automação</h6>
        <CreateAutomationForm orgSlug={orgSlug} />
      </section>

      <section>
        <h6 className="text-muted mb-3">Automações ({automations.length})</h6>
        {automations.length === 0 ? (
          <p className="text-muted text-sm">Ainda não há automações nesta organização.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {automations.map((automation) => (
              <div key={automation.id} className="card elev-sm">
                <div className="flex items-center justify-between">
                  <p className="card-title">{automation.name}</p>
                  <AutomationToggle
                    orgSlug={orgSlug}
                    automationId={automation.id}
                    enabled={automation.enabled}
                  />
                </div>
                <p className="card-meta">
                  Quando: {TRIGGER_TYPE_LABELS[automation.triggerType as TriggerType] ?? automation.triggerType}
                </p>
                {automation.actions.map((act) => (
                  <p className="card-meta" key={act.id}>
                    Faz: {ACTION_TYPE_LABELS[act.actionType as ActionType] ?? act.actionType}
                  </p>
                ))}
                <div>
                  <DeleteAutomationButton orgSlug={orgSlug} automationId={automation.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h6 className="text-muted mb-3">Execuções recentes ({runs.length})</h6>
        {runs.length === 0 ? (
          <p className="text-muted text-sm">Ainda não houve execuções.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Automação</th>
                <th>Estado</th>
                <th>Quando</th>
                <th>Erro</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>{run.automation.name}</td>
                  <td>
                    <span className={run.status === "SUCCESS" ? "tag tag-accent" : "tag tag-outline"}>
                      {run.status === "SUCCESS" ? "Sucesso" : "Falhou"}
                    </span>
                  </td>
                  <td className="text-muted">
                    {new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short" }).format(
                      run.ranAt,
                    )}
                  </td>
                  <td className="text-muted">{run.error ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
