-- CreateEnum
CREATE TYPE "InterviewPlan" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "InterviewKeySource" AS ENUM ('PLATFORM', 'USER_LOCAL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('CREATED', 'ACTIVE', 'SUMMARIZING', 'COMPLETED', 'ENDED_BY_USER', 'FAILED');

-- CreateEnum
CREATE TYPE "InterviewMessageRole" AS ENUM ('SYSTEM', 'INTERVIEWER', 'USER');

-- CreateTable
CREATE TABLE "UserInterviewProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "InterviewPlan" NOT NULL DEFAULT 'FREE',
    "platformFreeInterviewsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInterviewProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewPracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'CREATED',
    "keySource" "InterviewKeySource" NOT NULL,
    "role" TEXT NOT NULL,
    "companyStyle" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "questionLimit" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "deepgramRequestId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "endReason" TEXT,
    "summary" TEXT,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewPracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewPracticeMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "InterviewMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'deepgram',
    "eventType" TEXT,
    "sequence" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawEvent" JSONB,

    CONSTRAINT "InterviewPracticeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSessionToken" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewSessionToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInterviewProfile_userId_key" ON "UserInterviewProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewPracticeSession_publicId_key" ON "InterviewPracticeSession"("publicId");

-- CreateIndex
CREATE INDEX "InterviewPracticeSession_userId_createdAt_idx" ON "InterviewPracticeSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewPracticeSession_userId_status_idx" ON "InterviewPracticeSession"("userId", "status");

-- CreateIndex
CREATE INDEX "InterviewPracticeMessage_sessionId_occurredAt_idx" ON "InterviewPracticeMessage"("sessionId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewPracticeMessage_sessionId_sequence_key" ON "InterviewPracticeMessage"("sessionId", "sequence");

-- CreateIndex
CREATE INDEX "InterviewSessionToken_sessionId_idx" ON "InterviewSessionToken"("sessionId");

-- AddForeignKey
ALTER TABLE "UserInterviewProfile" ADD CONSTRAINT "UserInterviewProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPracticeSession" ADD CONSTRAINT "InterviewPracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPracticeMessage" ADD CONSTRAINT "InterviewPracticeMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewPracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSessionToken" ADD CONSTRAINT "InterviewSessionToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewPracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
