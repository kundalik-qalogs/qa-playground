import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getInterviewUserId,
  notFound,
  sanitizeSession,
  unauthorized,
} from "@/lib/interview-practice/api";

const ENDABLE_STATUSES = new Set(["CREATED", "ACTIVE", "SUMMARIZING"]);

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

  const session = await prisma.interviewPracticeSession.update({
    where: { id: existing.id },
    data: {
      status: "ENDED_BY_USER",
      endedAt: new Date(),
      endReason: "user_ended",
    },
  });

  return NextResponse.json({ session: sanitizeSession(session) });
}
