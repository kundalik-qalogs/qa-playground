import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  INTERVIEW_KEY_SOURCES,
  PLATFORM_FREE_INTERVIEW_LIMIT,
  canUsePlatformKey,
  isSupportedDuration,
  isSupportedQuestionLimit,
} from "@qa-playground/interview-core";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const INTERVIEW_SESSION_TOKEN_TTL_SECONDS = 5 * 60;

export async function getInterviewUserId(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message, details = undefined) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status: 400 },
  );
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function getOrCreateInterviewProfile(userId) {
  return prisma.userInterviewProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export function toUsageResponse(profile) {
  const platformFreeInterviewsRemaining = Math.max(
    0,
    PLATFORM_FREE_INTERVIEW_LIMIT - profile.platformFreeInterviewsUsed,
  );

  return {
    plan: profile.plan,
    platformFreeInterviewsLimit: PLATFORM_FREE_INTERVIEW_LIMIT,
    platformFreeInterviewsUsed: profile.platformFreeInterviewsUsed,
    platformFreeInterviewsRemaining,
  };
}

export function validateSessionInput(body) {
  const role = body?.role?.trim();
  const companyStyle = body?.companyStyle?.trim();
  const focus = body?.focus?.trim();
  const durationMinutes = Number(body?.durationMinutes);
  const questionLimit = Number(body?.questionLimit);
  const requestedKeySource = body?.keySource;
  const hasLocalKey = Boolean(body?.hasLocalKey);

  if (!role) return { error: "role required" };
  if (!companyStyle) return { error: "companyStyle required" };
  if (!focus) return { error: "focus required" };
  if (!isSupportedDuration(durationMinutes)) {
    return { error: "durationMinutes must be 10 or 15" };
  }
  if (!isSupportedQuestionLimit(questionLimit)) {
    return { error: "questionLimit must be 5, 7, or 10" };
  }
  if (
    requestedKeySource &&
    !Object.values(INTERVIEW_KEY_SOURCES).includes(requestedKeySource)
  ) {
    return { error: "keySource must be PLATFORM or USER_LOCAL" };
  }

  return {
    data: {
      role,
      companyStyle,
      focus,
      durationMinutes,
      questionLimit,
      requestedKeySource,
      hasLocalKey,
    },
  };
}

export function resolveKeySource(profile, input) {
  const platformAllowed = canUsePlatformKey({
    plan: profile.plan,
    durationMinutes: input.durationMinutes,
    platformFreeInterviewsUsed: profile.platformFreeInterviewsUsed,
  });

  if (
    input.requestedKeySource !== INTERVIEW_KEY_SOURCES.USER_LOCAL &&
    platformAllowed
  ) {
    return { keySource: INTERVIEW_KEY_SOURCES.PLATFORM };
  }

  if (input.hasLocalKey) {
    return { keySource: INTERVIEW_KEY_SOURCES.USER_LOCAL };
  }

  return {
    error:
      input.durationMinutes === 15
        ? "A local Deepgram key is required for 15 minute interviews."
        : "A local Deepgram key is required after the two free platform interviews are used.",
  };
}

export function createSessionToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(
    Date.now() + INTERVIEW_SESSION_TOKEN_TTL_SECONDS * 1000,
  );

  return { token, tokenHash, expiresAt };
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function verifySessionToken(token, tokenHash) {
  if (!token || !tokenHash) return false;

  const candidate = Buffer.from(hashSessionToken(token));
  const expected = Buffer.from(tokenHash);

  if (candidate.length !== expected.length) return false;

  return timingSafeEqual(candidate, expected);
}

export function sanitizeSession(session) {
  return {
    id: session.publicId,
    status: session.status,
    keySource: session.keySource,
    role: session.role,
    companyStyle: session.companyStyle,
    focus: session.focus,
    durationMinutes: session.durationMinutes,
    questionLimit: session.questionLimit,
    questionCount: session.questionCount,
    deepgramRequestId: session.deepgramRequestId,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    endReason: session.endReason,
    summary: session.summary,
    feedback: session.feedback,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function sanitizeMessage(message) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    source: message.source,
    eventType: message.eventType,
    sequence: message.sequence,
    occurredAt: message.occurredAt,
    rawEvent: message.rawEvent,
  };
}
