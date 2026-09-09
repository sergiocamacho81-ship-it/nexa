import type { Prisma } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { StageSelect } from "./stage-select";
import { DeleteDealButton } from "./delete-deal-button";

type DealWithRelations = Prisma.DealGetPayload<{
  include: {
    company: { select: { id: true; name: true } };
    contact: { select: { id: true; firstName: true; lastName: true } };
  };
}>;

export async function DealCard({ deal, orgSlug }: { deal: DealWithRelations; orgSlug: string }) {
  const locale = await getLocale();

  return (
    <div className="card elev-sm">
      <p className="card-title">{deal.title}</p>
      {deal.value !== null && (
        <p className="card-meta">{Number(deal.value).toLocaleString(locale, { style: "currency", currency: "EUR" })}</p>
      )}
      {deal.company && <p className="card-meta">{deal.company.name}</p>}
      {deal.contact && (
        <p className="card-meta">
          {deal.contact.firstName} {deal.contact.lastName ?? ""}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <StageSelect orgSlug={orgSlug} dealId={deal.id} currentStage={deal.stage} />
        <DeleteDealButton orgSlug={orgSlug} dealId={deal.id} />
      </div>
    </div>
  );
}
