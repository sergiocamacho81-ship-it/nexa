-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "acceptance_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "quotes_acceptance_token_key" ON "quotes"("acceptance_token");
