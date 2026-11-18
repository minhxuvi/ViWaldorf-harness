import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  buildSessionCookieOptions,
  createSession,
  registerUser,
  SESSION_COOKIE_NAME,
} from "@/lib/server/auth";
import { saveUserReadingProgress, toPublicAuthUser } from "@/lib/server/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      readingProgress?: unknown;
    };

    const user = registerUser({
      name: String(body.name || ""),
      email: String(body.email || ""),
      password: String(body.password || ""),
    });

    const savedProgress = body.readingProgress
      ? saveUserReadingProgress(Number(user.id), body.readingProgress)
      : null;

    const { token, expiresAt } = createSession(Number(user.id));
    const response = NextResponse.json(
      {
        user: toPublicAuthUser(user),
        readingProgress: savedProgress,
      },
      { status: 201 }
    );
    response.cookies.set(SESSION_COOKIE_NAME, token, buildSessionCookieOptions(expiresAt));
    return response;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Không thể đăng ký tài khoản lúc này." },
      { status: 500 }
    );
  }
}
