import { notFound } from "next/navigation";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCampaigns } from "@/app/actions/campaigns";
import { CreateCampaignForm } from "./create-campaign-form";
import { SendCampaignButton } from "./send-campaign-button";
import { DeleteCampaignButton } from "./delete-campaign-button";

const STATUS_LABELS = { DRAFT: "Rascunho", SENDING: "A enviar...", SENT: "Enviada" };

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

  const campaigns = await listCampaigns(orgSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">Nova campanha</h6>
        <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
          Enviada a todos os contactos da organização com email registado.
        </p>
        <CreateCampaignForm orgSlug={orgSlug} />
      </section>

      <section>
        <h6 className="text-muted mb-3">Campanhas ({campaigns.length})</h6>
        {campaigns.length === 0 ? (
          <p className="text-muted text-sm">Ainda não há campanhas nesta organização.</p>
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
                      {STATUS_LABELS[campaign.status]}
                    </span>
                  </div>
                  <p className="card-meta">{campaign.subject}</p>
                  <p className="card-meta">
                    {campaign.recipients.length} destinatário(s) — {sent} enviado(s)
                    {failed > 0 ? `, ${failed} falhou/falharam` : ""}
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
