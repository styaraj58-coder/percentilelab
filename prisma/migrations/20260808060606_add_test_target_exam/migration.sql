-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "targetExam" TEXT NOT NULL DEFAULT 'MH-CET (MBA)';

-- CreateIndex
CREATE INDEX "Test_targetExam_idx" ON "Test"("targetExam");
