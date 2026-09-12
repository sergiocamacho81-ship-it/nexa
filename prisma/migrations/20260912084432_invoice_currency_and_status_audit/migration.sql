-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'CHF';

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'CHF';

-- CreateTable
CREATE TABLE "invoice_status_events" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "from_status" "InvoiceStatus" NOT NULL,
    "to_status" "InvoiceStatus" NOT NULL,
    "changed_by_user_id" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_status_events_invoice_id_idx" ON "invoice_status_events"("invoice_id");

-- AddForeignKey
ALTER TABLE "invoice_status_events" ADD CONSTRAINT "invoice_status_events_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
