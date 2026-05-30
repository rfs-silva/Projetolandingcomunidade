-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "featuredAsLeader" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN "leaderRole" TEXT;

-- CreateIndex
CREATE INDEX "Profile_featuredAsLeader_idx" ON "Profile"("featuredAsLeader");
