import { NextRequest, NextResponse } from "next/server";
import {
  buildExpiredCookieOptions,
  destroySession,
  SESSION_COOKIE_NAME,
} from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  destroySession(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", buildExpiredCookieOptions());
  return response;
}
