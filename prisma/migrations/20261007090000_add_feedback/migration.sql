-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "exam" TEXT NOT NULL,
    "college" TEXT,
    "rating" INTEGER NOT NULL,
    "liked" TEXT,
    "improve" TEXT,
    "quote" TEXT,
    "firstPercentile" DOUBLE PRECISION,
    "latestPercentile" DOUBLE PRECISION,
    "publishAs" TEXT NOT NULL,
    "ageConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL DEFAULT 'v1',
    "consentGivenAt" TIMESTAMP(3),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep Supabase's auto-generated REST/GraphQL API closed off, matching every
-- other table (see 20260906065457_enable_row_level_security).
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
