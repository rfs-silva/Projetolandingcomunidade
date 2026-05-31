-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PENDING_APPROVAL', 'PUBLISHED', 'REJECTED');

-- AlterTable Event
ALTER TABLE "Event" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Event" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Event" ADD COLUMN "reviewerNote" TEXT;
ALTER TABLE "Event" ADD COLUMN "reviewedById" TEXT;
ALTER TABLE "Event" ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- AlterTable Challenge
ALTER TABLE "Challenge" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Challenge" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "reviewerNote" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "reviewedById" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Event_status_createdAt_idx" ON "Event"("status", "createdAt");
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");
CREATE INDEX "Challenge_status_createdAt_idx" ON "Challenge"("status", "createdAt");
CREATE INDEX "Challenge_createdById_idx" ON "Challenge"("createdById");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
