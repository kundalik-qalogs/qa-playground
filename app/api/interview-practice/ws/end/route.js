import { NextResponse } from "next/server";
import { INTERVIEW_END_REASONS } from "@qa-playground/interview-core";
import { prisma } from "@/lib/prisma";
import { sanitizeSession } from "@/lib/interview-practice/api";
import { forbidden, isInternalWsRequest } from "../_internal";

export async function POST(request) {
  if (!isInternalWsRequest(request)) return forbidden();

  const body = await request.json();
  const sessionId = String(body?.sessionId || "").trim();
  const reason = String(
    body?.reason || INTERVIEW_END_REASONS.CONNECTION_CLOSED,
  );

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const session = await prisma.interviewPracticeSession.findUnique({
    where: { publicId: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (["COMPLETED", "ENDED_BY_USER", "FAILED"].includes(session.status)) {
    return NextResponse.json({ session: sanitizeSession(session) });
  }

  const status =
    reason === INTERVIEW_END_REASONS.USER_ENDED
      ? "ENDED_BY_USER"
      : reason === INTERVIEW_END_REASONS.DEEPGRAM_ERROR
        ? "FAILED"
        : "COMPLETED";

  const updatedSession = await prisma.interviewPracticeSession.update({
    where: { id: session.id },
    data: {
      status,
      endedAt: new Date(),
      endReason: reason,
    },
  });

  return NextResponse.json({ session: sanitizeSession(updatedSession) });
}
