import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listAutomations, listAutomationRuns } from "@/app/actions/automations";
import { triggerMessageKey, type ActionType } from "@/lib/automation/types";
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
  const [t, tTriggers, tActions, locale] = await Promise.all([
    getTranslations("Automations"),
    getTranslations("TriggerTypes"),
    getTranslations("ActionTypes"),
    getLocale(),
  ]);

  const [automations, runs] = await Promise.all([
    listAutomations(orgSlug),
    listAutomationRuns(orgSlug),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newAutomation")}</h6>
        <CreateAutomationForm orgSlug={orgSlug} />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: automations.length })}</h6>
        {automations.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
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
                  {t("whenLabel", { trigger: tTriggers(triggerMessageKey(automation.triggerType)) })}
                </p>
                {automation.actions.map((act) => (
                  <p className="card-meta" key={act.id}>
                    {t("doLabel", { action: tActions(act.actionType as ActionType) })}
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
        <h6 className="text-muted mb-3">{t("runsHeading", { count: runs.length })}</h6>
        {runs.length === 0 ? (
          <p className="text-muted text-sm">{t("none_runs")}</p>
        ) : (
          <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("runsTableAutomation")}</th>
                <th>{t("runsTableStatus")}</th>
                <th>{t("runsTableWhen")}</th>
                <th>{t("runsTableError")}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>{run.automation.name}</td>
                  <td>
                    <span className={run.status === "SUCCESS" ? "tag tag-accent" : "tag tag-outline"}>
                      {run.status === "SUCCESS" ? t("success") : t("failed")}
                    </span>
                  </td>
                  <td className="text-muted">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(
                      run.ranAt,
                    )}
                  </td>
                  <td className="text-muted">{run.error ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </div>
  );
}
