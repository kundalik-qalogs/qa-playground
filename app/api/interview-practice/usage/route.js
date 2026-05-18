import { NextResponse } from "next/server";
import {
  getInterviewUserId,
  getOrCreateInterviewProfile,
  toUsageResponse,
  unauthorized,
} from "@/lib/interview-practice/api";

export async function GET(request) {
  const userId = await getInterviewUserId(request);
  if (!userId) return unauthorized();

  const profile = await getOrCreateInterviewProfile(userId);

  return NextResponse.json(toUsageResponse(profile));
}
