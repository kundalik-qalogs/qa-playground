import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sanitizeSession,
  verifySessionToken,
} from "@/lib/interview-practice/api";
import { forbidden, isInternalWsRequest } from "../_internal";

export async function POST(request) {
  if (!isInternalWsRequest(request)) return forbidden();

  const body = await request.json();
  const sessionId = String(body?.sessionId || "").trim();
  const token = String(body?.token || "").trim();

  if (!sessionId || !token) {
    return NextResponse.json(
      { error: "sessionId and token are required" },
      { status: 400 },
    );
  }

  const now = new Date();
  const session = await prisma.interviewPracticeSession.findUnique({
    where: { publicId: sessionId },
    include: {
      tokens: {
        where: {
          usedAt: null,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const matchingToken = session.tokens.find((candidate) =>
    verifySessionToken(token, candidate.tokenHash),
  );

  if (!matchingToken) {
    return NextResponse.json(
      { error: "Invalid or expired websocket token" },
      { status: 401 },
    );
  }

  const updatedSession = await prisma.$transaction(async (tx) => {
    await tx.interviewSessionToken.update({
      where: { id: matchingToken.id },
      data: { usedAt: now },
    });

    if (session.status === "CREATED") {
      return tx.interviewPracticeSession.update({
        where: { id: session.id },
        data: {
          status: "ACTIVE",
          startedAt: session.startedAt || now,
        },
      });
    }

    return session;
  });

  return NextResponse.json({ session: sanitizeSession(updatedSession) });
}
