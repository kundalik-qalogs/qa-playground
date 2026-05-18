import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getInterviewUserId,
  notFound,
  sanitizeMessage,
  sanitizeSession,
  unauthorized,
} from "@/lib/interview-practice/api";

export async function GET(request, { params }) {
  const userId = await getInterviewUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const session = await prisma.interviewPracticeSession.findFirst({
    where: { userId, publicId: id },
    include: {
      messages: {
        orderBy: { sequence: "asc" },
      },
    },
  });

  if (!session) return notFound();

  return NextResponse.json({
    session: sanitizeSession(session),
    messages: session.messages.map(sanitizeMessage),
  });
}
