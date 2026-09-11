import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { getOrganizationSettings } from "@/app/actions/settings";
import { listTrash } from "@/app/actions/trash";
import { RestoreTrashButton } from "./restore-trash-button";

const TYPE_LABEL_KEY = {
  contact: "typeContact",
  company: "typeCompany",
  deal: "typeDeal",
  job: "typeJob",
  project: "typeProject",
  activity: "typeActivity",
  task: "typeTask",
  segment: "typeSegment",
  automation: "typeAutomation",
  campaign: "typeCampaign",
  member: "typeMember",
  product: "typeProduct",
  invoice: "typeInvoice",
} as const;

export default async function TrashPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const [t, locale, settings, items] = await Promise.all([
    getTranslations("Trash"),
    getLocale(),
    getOrganizationSettings(orgSlug),
    listTrash(orgSlug),
  ]);

  const canManage = settings?.currentUserRole === "OWNER" || settings?.currentUserRole === "ADMIN";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: items.length })}</h6>
        <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
          {t("hint")}
        </p>
        {!canManage && <p className="text-muted text-sm">{t("readOnlyHint")}</p>}

        {items.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="card elev-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="tag tag-accent" style={{ marginRight: "8px" }}>
                      {t(TYPE_LABEL_KEY[item.type])}
                    </span>
                    <span className="card-title">{item.label || "—"}</span>
                    <p className="card-meta">
                      {t("deletedOn", { date: dateFormatter.format(item.deletedAt) })}
                    </p>
                  </div>
                  {canManage && (
                    <RestoreTrashButton orgSlug={orgSlug} type={item.type} id={item.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
