import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  getInterviewUserId,
  notFound,
  sanitizeSession,
  unauthorized,
} from "@/lib/interview-practice/api";
import {
  canGenerateInterviewReview,
  finalizeInterviewSessionWithReview,
} from "@/lib/interview-practice/review";

export async function POST(request, { params }) {
  const userId = await getInterviewUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const session = await prisma.interviewPracticeSession.findFirst({
    where: { userId, publicId: id },
  });

  if (!session) return notFound();

  if (!canGenerateInterviewReview(session)) {
    return badRequest("Feedback can only be generated after the session ends.");
  }

  const { session: updatedSession, reviewError } =
    await finalizeInterviewSessionWithReview({
      session,
      finalStatus: session.status,
      endReason: session.endReason,
      endedAt: session.endedAt || new Date(),
    });

  return NextResponse.json({
    session: sanitizeSession(updatedSession),
    ...(reviewError ? { reviewError } : {}),
  });
}
