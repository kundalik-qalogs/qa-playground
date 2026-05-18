import { NextResponse } from "next/server";

export function isInternalWsRequest(request) {
  const configuredSecret = process.env.INTERVIEW_WS_INTERNAL_SECRET;

  if (!configuredSecret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("x-interview-ws-secret") === configuredSecret;
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
