import { notFound } from "next/navigation";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { listDeals } from "@/app/actions/deals";
import { DEAL_STAGES, DEAL_STAGE_LABELS } from "@/lib/deal-stages";
import { prisma } from "@/lib/prisma";
import { CreateDealForm } from "./create-deal-form";
import { DealCard } from "./deal-card";

export default async function DealsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const [deals, companies, contacts] = await Promise.all([
    listDeals(orgSlug),
    listCompanies(orgSlug),
    prisma.contact.findMany({
      where: { organizationId: organization.id },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">Novo negócio</h6>
        <CreateDealForm orgSlug={orgSlug} companies={companies} contacts={contacts} />
      </section>

      <section>
        <h6 className="text-muted mb-3">Pipeline ({deals.length})</h6>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${DEAL_STAGES.length}, minmax(180px, 1fr))`, overflowX: "auto" }}
        >
          {DEAL_STAGES.map((stage) => {
            const stageDeals = deals.filter((deal) => deal.stage === stage);
            return (
              <div key={stage} className="flex flex-col gap-2">
                <h6 className="text-muted">
                  {DEAL_STAGE_LABELS[stage]} ({stageDeals.length})
                </h6>
                <div className="flex flex-col gap-2">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} orgSlug={orgSlug} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
