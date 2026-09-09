import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrgForCurrentUser } from "@/app/actions/contacts";
import { listCompanies } from "@/app/actions/companies";
import { listSegments } from "@/app/actions/segments";
import { describeSegmentFilters } from "@/lib/segments/filters";
import { CreateSegmentForm } from "./create-segment-form";
import { DeleteSegmentButton } from "./delete-segment-button";

export default async function SegmentsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = await getOrgForCurrentUser(orgSlug);
  if (!organization) {
    notFound();
  }

  const t = await getTranslations("Segments");
  const [segments, companies] = await Promise.all([listSegments(orgSlug), listCompanies(orgSlug)]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <section>
        <h6 className="text-muted mb-3">{t("newSegment")}</h6>
        <p className="text-muted text-sm" style={{ marginTop: "-8px", marginBottom: "8px" }}>
          {t("hint")}
        </p>
        <CreateSegmentForm orgSlug={orgSlug} companies={companies} />
      </section>

      <section>
        <h6 className="text-muted mb-3">{t("heading", { count: segments.length })}</h6>
        {segments.length === 0 ? (
          <p className="text-muted text-sm">{t("none")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {segments.map((segment) => (
              <div key={segment.id} className="card elev-sm">
                <div className="flex items-center justify-between">
                  <p className="card-title">{segment.name}</p>
                  <span className="tag tag-accent">
                    {t("contactCount", { count: segment.contactCount })}
                  </span>
                </div>
                {segment.description && <p className="card-body">{segment.description}</p>}
                <p className="card-meta">{describeSegmentFilters(segment.filters, t)}</p>
                <div>
                  <DeleteSegmentButton orgSlug={orgSlug} segmentId={segment.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
