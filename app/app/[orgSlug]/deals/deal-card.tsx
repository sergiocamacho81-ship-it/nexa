import type { Prisma } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { StageSelect } from "./stage-select";
import { DeleteDealButton } from "./delete-deal-button";
import { createInvoiceForDeal } from "@/app/actions/invoices";
import { createQuoteForDeal } from "@/app/actions/quotes";

type DealWithRelations = Prisma.DealGetPayload<{
  include: {
    company: { select: { id: true; name: true } };
    contact: { select: { id: true; firstName: true; lastName: true } };
  };
}>;

export async function DealCard({ deal, orgSlug }: { deal: DealWithRelations; orgSlug: string }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Deals")]);

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
        <div className="flex gap-2">
          <form action={createQuoteForDeal}>
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="dealId" value={deal.id} />
            <button type="submit" className="btn btn-ghost" style={{ fontSize: "12px", padding: "2px 6px" }}>
              {t("createQuote")}
            </button>
          </form>
          <form action={createInvoiceForDeal}>
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="dealId" value={deal.id} />
            <button type="submit" className="btn btn-ghost" style={{ fontSize: "12px", padding: "2px 6px" }}>
              {t("createInvoice")}
            </button>
          </form>
          <DeleteDealButton orgSlug={orgSlug} dealId={deal.id} />
        </div>
      </div>
    </div>
  );
}
