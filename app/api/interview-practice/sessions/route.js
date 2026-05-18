import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  createSessionToken,
  getInterviewUserId,
  getOrCreateInterviewProfile,
  resolveKeySource,
  sanitizeSession,
  toUsageResponse,
  unauthorized,
  validateSessionInput,
} from "@/lib/interview-practice/api";

export async function GET(request) {
  const userId = await getInterviewUserId(request);
  if (!userId) return unauthorized();

  const sessions = await prisma.interviewPracticeSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ sessions: sessions.map(sanitizeSession) });
}

export async function POST(request) {
  const userId = await getInterviewUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json();
  const validation = validateSessionInput(body);
  if (validation.error) return badRequest(validation.error);

  const profile = await getOrCreateInterviewProfile(userId);
  const keyResolution = resolveKeySource(profile, validation.data);
  if (keyResolution.error) {
    return badRequest(keyResolution.error, { usage: toUsageResponse(profile) });
  }

  const { token, tokenHash, expiresAt } = createSessionToken();

  const { session, updatedProfile } = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.interviewPracticeSession.create({
      data: {
        userId,
        keySource: keyResolution.keySource,
        role: validation.data.role,
        companyStyle: validation.data.companyStyle,
        focus: validation.data.focus,
        durationMinutes: validation.data.durationMinutes,
        questionLimit: validation.data.questionLimit,
      },
    });

    let nextProfile = profile;
    if (keyResolution.keySource === "PLATFORM") {
      nextProfile = await tx.userInterviewProfile.update({
        where: { userId },
        data: { platformFreeInterviewsUsed: { increment: 1 } },
      });
    }

    await tx.interviewSessionToken.create({
      data: {
        sessionId: createdSession.id,
        tokenHash,
        expiresAt,
      },
    });

    return { session: createdSession, updatedProfile: nextProfile };
  });

  return NextResponse.json(
    {
      session: sanitizeSession(session),
      usage: toUsageResponse(updatedProfile),
      websocket: {
        sessionId: session.publicId,
        token,
        expiresAt,
        url: process.env.INTERVIEW_WS_URL || null,
        keySource: session.keySource,
      },
    },
    { status: 201 },
  );
}
