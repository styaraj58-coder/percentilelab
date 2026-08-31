-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "isFreePreview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;
