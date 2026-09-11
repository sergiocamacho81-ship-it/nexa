-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable: Contact address/country foundation
ALTER TABLE "contacts" ADD COLUMN     "address_line" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "country_code" TEXT;

-- AlterTable: Company address/country foundation (mirrors Contact)
ALTER TABLE "companies" ADD COLUMN     "address_line" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "canton" "SwissCanton",
ADD COLUMN     "country_code" TEXT;

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "deal_id" UUID,
    "company_id" UUID,
    "contact_id" UUID,
    "title" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_organization_id_idx" ON "jobs"("organization_id");

-- CreateIndex
CREATE INDEX "jobs_deal_id_idx" ON "jobs"("deal_id");

-- CreateIndex
CREATE INDEX "jobs_company_id_idx" ON "jobs"("company_id");

-- CreateIndex
CREATE INDEX "jobs_contact_id_idx" ON "jobs"("contact_id");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: invoices gains job_id ahead of the data migration below
ALTER TABLE "invoices" ADD COLUMN "job_id" UUID;

-- Data migration: preserve the existing invoice<->deal link instead of
-- losing it when deal_id is dropped. As of this migration, real data
-- exists (invoice #1 -> a real Deal) — this is not a greenfield change.
-- Creates one Job per distinct Deal currently referenced by an invoice,
-- then repoints that invoice's job_id at it. Mirrors the same
-- find-or-create-Job-per-Deal behavior createInvoiceForDeal now uses going
-- forward (see app/actions/invoices.ts).
INSERT INTO "jobs" ("id", "organization_id", "deal_id", "company_id", "contact_id", "title", "status", "created_at", "updated_at")
SELECT gen_random_uuid(), d."organization_id", d."id", d."company_id", d."contact_id", d."title", 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "deals" d
WHERE d."id" IN (SELECT DISTINCT "deal_id" FROM "invoices" WHERE "deal_id" IS NOT NULL);

UPDATE "invoices" i
SET "job_id" = j."id"
FROM "jobs" j
WHERE j."deal_id" = i."deal_id" AND i."deal_id" IS NOT NULL;

-- AlterTable: drop the old link now that every invoice that had one has a job_id
ALTER TABLE "invoices" DROP COLUMN "deal_id";

-- CreateIndex
CREATE INDEX "invoices_job_id_idx" ON "invoices"("job_id");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
