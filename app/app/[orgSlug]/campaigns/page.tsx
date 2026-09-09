import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCampaigns } from "@/app/actions/campaigns";
import { listSegments } from "@/app/actions/segments";
import { CreateCampaignForm } from "./create-campaign-form";
import { SendCampaignButton } from "./send-campaign-button";
import { DeleteCampaignButton } from "./delete-campaign-button";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }
  const t = await getTranslations("Campaigns");
  const statusLabels = {
    DRAFT: t("statusDraft"),
    SENDING: t("statusSending"),
    SENT: t("statusSent"),
  };

  const [campaigns, segments] = await Promise.all([listCampaigns(orgSlug), listSegments(orgSlug)]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newCampaign")}</h6>
        <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
          {t("hint")}
        </p>
        <CreateCampaignForm orgSlug={orgSlug} segments={segments} />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: campaigns.length })}</h6>
        {campaigns.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {campaigns.map((campaign) => {
              const sent = campaign.recipients.filter((r) => r.status === "SENT").length;
              const failed = campaign.recipients.filter((r) => r.status === "FAILED").length;
              return (
                <div key={campaign.id} className="card elev-sm">
                  <div className="flex items-center justify-between">
                    <p className="card-title">{campaign.name}</p>
                    <span
                      className={campaign.status === "SENT" ? "tag tag-accent" : "tag tag-neutral"}
                    >
                      {statusLabels[campaign.status]}
                    </span>
                  </div>
                  <p className="card-meta">{campaign.subject}</p>
                  {campaign.segment && (
                    <p className="card-meta">{t("segmentLabel", { name: campaign.segment.name })}</p>
                  )}
                  <p className="card-meta">
                    {t("recipientsSummary", { count: campaign.recipients.length, sent })}
                    {failed > 0 ? t("recipientsFailedSuffix", { count: failed }) : ""}
                  </p>
                  <div className="flex gap-2">
                    {campaign.status === "DRAFT" && (
                      <SendCampaignButton orgSlug={orgSlug} campaignId={campaign.id} />
                    )}
                    <DeleteCampaignButton orgSlug={orgSlug} campaignId={campaign.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
