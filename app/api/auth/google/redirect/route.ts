import { NextRequest, NextResponse } from "next/server";
import {
  buildGoogleAuthorizationUrl,
  generateOAuthState,
  isGoogleOAuthConfigured,
  OAUTH_STATE_COOKIE_NAME,
} from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!isGoogleOAuthConfigured(origin)) {
    const fallback = new URL("/", origin);
    fallback.searchParams.set(
      "authError",
      "Đăng nhập Google chưa được cấu hình. Vui lòng dùng email và mật khẩu."
    );
    return NextResponse.redirect(fallback);
  }

  const state = generateOAuthState();
  const googleAuthUrl = buildGoogleAuthorizationUrl(state, origin);

  const response = NextResponse.redirect(googleAuthUrl);
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
