import { NextResponse } from "next/server";
import {
  getInterviewEndCondition,
  isInterviewerQuestion,
} from "@qa-playground/interview-core";
import { prisma } from "@/lib/prisma";
import { sanitizeMessage, sanitizeSession } from "@/lib/interview-practice/api";
import { finalizeInterviewSessionWithReview } from "@/lib/interview-practice/review";
import { forbidden, isInternalWsRequest } from "../_internal";

const CLOSED_STATUSES = new Set([
  "SUMMARIZING",
  "COMPLETED",
  "ENDED_BY_USER",
  "FAILED",
]);

export async function POST(request) {
  if (!isInternalWsRequest(request)) return forbidden();

  const body = await request.json();
  const sessionId = String(body?.sessionId || "").trim();
  const message = body?.message;

  if (!sessionId || !message?.content || !message?.role) {
    return NextResponse.json(
      { error: "sessionId and message are required" },
      { status: 400 },
    );
  }

  const session = await prisma.interviewPracticeSession.findUnique({
    where: { publicId: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (CLOSED_STATUSES.has(session.status)) {
    return NextResponse.json({
      session: sanitizeSession(session),
      endCondition: { shouldEnd: true, reason: session.endReason },
    });
  }

  const sequence = Number(message.sequence || 0);
  const createdMessage = await prisma.interviewPracticeMessage.upsert({
    where: {
      sessionId_sequence: {
        sessionId: session.id,
        sequence,
      },
    },
    create: {
      sessionId: session.id,
      role: message.role,
      content: String(message.content),
      source: String(message.source || "deepgram"),
      eventType: message.eventType ? String(message.eventType) : null,
      sequence,
      rawEvent: message.rawEvent || null,
    },
    update: {
      role: message.role,
      content: String(message.content),
      source: String(message.source || "deepgram"),
      eventType: message.eventType ? String(message.eventType) : null,
      rawEvent: message.rawEvent || null,
    },
  });

  let updatedSession = session;
  if (isInterviewerQuestion(createdMessage)) {
    updatedSession = await prisma.interviewPracticeSession.update({
      where: { id: session.id },
      data: { questionCount: { increment: 1 } },
    });
  }

  const endCondition = getInterviewEndCondition({
    startedAt: updatedSession.startedAt,
    durationMinutes: updatedSession.durationMinutes,
    questionLimit: updatedSession.questionLimit,
    questionCount: updatedSession.questionCount,
  });

  let reviewError = null;
  if (endCondition.shouldEnd) {
    const result = await finalizeInterviewSessionWithReview({
      session: updatedSession,
      finalStatus: "COMPLETED",
      endReason: endCondition.reason,
    });
    updatedSession = result.session;
    reviewError = result.reviewError;
  }

  return NextResponse.json({
    message: sanitizeMessage(createdMessage),
    session: sanitizeSession(updatedSession),
    endCondition,
    ...(reviewError ? { reviewError } : {}),
  });
}
