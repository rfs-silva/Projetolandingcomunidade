-- CreateEnum
CREATE TYPE "MentorshipKind" AS ENUM ('MENTOR', 'MENTEE');

-- DropIndex
DROP INDEX "MentorshipApplication_userId_idx";

-- AlterTable
ALTER TABLE "MentorshipApplication" ADD COLUMN     "kind" "MentorshipKind" NOT NULL DEFAULT 'MENTEE';

-- CreateIndex
CREATE INDEX "MentorshipApplication_userId_kind_idx" ON "MentorshipApplication"("userId", "kind");
