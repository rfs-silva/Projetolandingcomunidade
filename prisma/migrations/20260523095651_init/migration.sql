-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('REMOTO', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'MEMBERS');

-- CreateEnum
CREATE TYPE "ProjectCategoryDb" AS ENUM ('FRONTEND', 'BACKEND', 'MOBILE', 'FULLSTACK');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('MEMBER', 'COMPANY', 'LEADER', 'FOUNDER');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('STACK', 'TOPIC');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT,
    "acceptedTermsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "linkedinUrl" TEXT,
    "type" "ProfileType" NOT NULL DEFAULT 'MEMBER',
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL DEFAULT 'STACK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileTag" (
    "profileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProfileTag_pkey" PRIMARY KEY ("profileId","tagId")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateFull" TEXT NOT NULL,
    "dateShort" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "imageIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageIndex" INTEGER NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTag" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ChallengeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "image" TEXT,
    "category" "ProjectCategoryDb" NOT NULL,
    "demoUrl" TEXT,
    "repoUrl" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'MEMBERS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProjectTag" (
    "projectId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "UserProjectTag_pkey" PRIMARY KEY ("projectId","tagId")
);

-- CreateTable
CREATE TABLE "MentorshipApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "stack" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_type_idx" ON "Profile"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "ProfileTag_tagId_idx" ON "ProfileTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_number_key" ON "Event"("number");

-- CreateIndex
CREATE INDEX "Event_visibility_idx" ON "Event"("visibility");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_number_key" ON "Challenge"("number");

-- CreateIndex
CREATE INDEX "Challenge_visibility_idx" ON "Challenge"("visibility");

-- CreateIndex
CREATE INDEX "ChallengeTag_challengeId_idx" ON "ChallengeTag"("challengeId");

-- CreateIndex
CREATE INDEX "UserProject_category_idx" ON "UserProject"("category");

-- CreateIndex
CREATE INDEX "UserProject_visibility_idx" ON "UserProject"("visibility");

-- CreateIndex
CREATE INDEX "UserProject_userId_idx" ON "UserProject"("userId");

-- CreateIndex
CREATE INDEX "UserProjectTag_tagId_idx" ON "UserProjectTag"("tagId");

-- CreateIndex
CREATE INDEX "MentorshipApplication_userId_idx" ON "MentorshipApplication"("userId");

-- CreateIndex
CREATE INDEX "MentorshipApplication_status_idx" ON "MentorshipApplication"("status");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTag" ADD CONSTRAINT "ChallengeTag_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProjectTag" ADD CONSTRAINT "UserProjectTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "UserProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProjectTag" ADD CONSTRAINT "UserProjectTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipApplication" ADD CONSTRAINT "MentorshipApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
