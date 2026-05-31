-- DropIndex
DROP INDEX IF EXISTS "User_githubId_key";
DROP INDEX IF EXISTS "User_githubUsername_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "githubId" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "githubUsername" DROP NOT NULL;

-- Recreate unique indexes (Postgres aceita NULL como nao-conflitante)
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

-- CreateEnum
CREATE TYPE "CompanyApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CompanyApplication" (
  "id" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "website" TEXT,
  "linkedinUrl" TEXT,
  "description" TEXT NOT NULL,
  "status" "CompanyApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerNote" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "approvedUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CompanyApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApplication_approvedUserId_key" ON "CompanyApplication"("approvedUserId");
CREATE INDEX "CompanyApplication_status_createdAt_idx" ON "CompanyApplication"("status", "createdAt");
CREATE INDEX "CompanyApplication_email_idx" ON "CompanyApplication"("email");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "CompanyApplication" ADD CONSTRAINT "CompanyApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
