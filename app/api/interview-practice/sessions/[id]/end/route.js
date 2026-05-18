import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getInterviewUserId,
  notFound,
  sanitizeSession,
  unauthorized,
} from "@/lib/interview-practice/api";
import { finalizeInterviewSessionWithReview } from "@/lib/interview-practice/review";

const ENDABLE_STATUSES = new Set(["CREATED", "ACTIVE"]);

export async function PATCH(request, { params }) {
  const userId = await getInterviewUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const existing = await prisma.interviewPracticeSession.findFirst({
    where: { userId, publicId: id },
  });

  if (!existing) return notFound();

  if (!ENDABLE_STATUSES.has(existing.status)) {
    return NextResponse.json({ session: sanitizeSession(existing) });
  }

  const { session, reviewError } = await finalizeInterviewSessionWithReview({
    session: existing,
    finalStatus: "ENDED_BY_USER",
    endReason: "user_ended",
  });

  return NextResponse.json({
    session: sanitizeSession(session),
    ...(reviewError ? { reviewError } : {}),
  });
}
