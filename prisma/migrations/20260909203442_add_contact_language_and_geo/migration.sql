-- CreateEnum
CREATE TYPE "ContactLanguage" AS ENUM ('pt', 'en', 'fr', 'de', 'it');

-- CreateEnum
CREATE TYPE "SwissCanton" AS ENUM ('AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH');

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "canton" "SwissCanton",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "preferred_language" "ContactLanguage";
