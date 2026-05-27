-- CreateEnum
CREATE TYPE "PrivacyEventType" AS ENUM ('TERMS_ACCEPTED', 'DATA_EXPORTED', 'ACCOUNT_DELETED', 'PROFILE_TYPE_CHANGED');

-- CreateTable
CREATE TABLE "PrivacyEvent" (
    "id" TEXT NOT NULL,
    "type" "PrivacyEventType" NOT NULL,
    "subjectUserId" TEXT,
    "subjectGithubId" TEXT NOT NULL,
    "subjectUsername" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorGithubId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivacyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrivacyEvent_subjectGithubId_createdAt_idx" ON "PrivacyEvent"("subjectGithubId", "createdAt");

-- CreateIndex
CREATE INDEX "PrivacyEvent_type_createdAt_idx" ON "PrivacyEvent"("type", "createdAt");
