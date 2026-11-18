import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  buildSessionCookieOptions,
  createSession,
  loginUser,
  SESSION_COOKIE_NAME,
} from "@/lib/server/auth";
import { mergeReadingProgress } from "@/lib/readingProgress";
import {
  getUserReadingProgress,
  saveUserReadingProgress,
  toPublicAuthUser,
} from "@/lib/server/db";
import { sanitizeReadingProgress } from "@/lib/readingProgress";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      readingProgress?: unknown;
    };

    const user = loginUser({
      email: String(body.email || ""),
      password: String(body.password || ""),
    });

    const userId = Number(user.id);
    const remoteProgress = getUserReadingProgress(userId);
    const localProgress = sanitizeReadingProgress(body.readingProgress);
    const mergedProgress = mergeReadingProgress(localProgress, remoteProgress);

    let finalProgress = remoteProgress;
    if (mergedProgress) {
      finalProgress = saveUserReadingProgress(userId, mergedProgress) || mergedProgress;
    }

    const { token, expiresAt } = createSession(userId);
    const response = NextResponse.json({
      user: toPublicAuthUser(user),
      readingProgress: finalProgress,
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, buildSessionCookieOptions(expiresAt));
    return response;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Không thể đăng nhập lúc này." }, { status: 500 });
  }
}
