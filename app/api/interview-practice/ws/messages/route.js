import { NextResponse } from "next/server";
import {
  getInterviewEndCondition,
  isInterviewerQuestion,
} from "@qa-playground/interview-core";
import { prisma } from "@/lib/prisma";
import { sanitizeMessage, sanitizeSession } from "@/lib/interview-practice/api";
import { forbidden, isInternalWsRequest } from "../_internal";

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

  if (endCondition.shouldEnd) {
    updatedSession = await prisma.interviewPracticeSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        endReason: endCondition.reason,
      },
    });
  }

  return NextResponse.json({
    message: sanitizeMessage(createdMessage),
    session: sanitizeSession(updatedSession),
    endCondition,
  });
}
