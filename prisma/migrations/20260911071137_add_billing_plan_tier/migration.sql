-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'GRANDFATHERED');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "plan_tier" "PlanTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;
