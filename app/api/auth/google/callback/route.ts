import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  authenticateWithGoogleProfile,
  buildExpiredCookieOptions,
  buildSessionCookieOptions,
  createSession,
  exchangeGoogleCodeForProfile,
  isGoogleOAuthConfigured,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectWithError(origin: string, message: string): NextResponse {
  const target = new URL("/", origin);
  target.searchParams.set("authError", message);
  const res = NextResponse.redirect(target);
  res.cookies.set(OAUTH_STATE_COOKIE_NAME, "", buildExpiredCookieOptions());
  return res;
}

export async function GET(request: NextRequest) {
  const origin = process.env.APP_URL?.trim() || request.nextUrl.origin;

  if (!isGoogleOAuthConfigured(request.nextUrl.origin)) {
    return redirectWithError(
      origin,
      "Đăng nhập Google chưa được cấu hình. Vui lòng dùng email và mật khẩu."
    );
  }

  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError) {
    return redirectWithError(origin, "Bạn đã hủy đăng nhập bằng Google. Bạn có thể thử lại bất kỳ lúc nào.");
  }

  const code = request.nextUrl.searchParams.get("code") || "";
  const returnedState = request.nextUrl.searchParams.get("state") || "";
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value || "";

  const statesMatch =
    Boolean(returnedState) &&
    Boolean(storedState) &&
    returnedState.length === storedState.length &&
    crypto.timingSafeEqual(Buffer.from(returnedState), Buffer.from(storedState));

  if (!code || !statesMatch) {
    return redirectWithError(origin, "Phiên xác thực Google không hợp lệ hoặc đã hết hạn.");
  }

  try {
    const profile = await exchangeGoogleCodeForProfile(code, request.nextUrl.origin);
    const user = authenticateWithGoogleProfile(profile);
    const { token, expiresAt } = createSession(Number(user.id));

    const target = new URL("/", origin);
    const response = NextResponse.redirect(target);
    response.cookies.set(OAUTH_STATE_COOKIE_NAME, "", buildExpiredCookieOptions());
    response.cookies.set(SESSION_COOKIE_NAME, token, buildSessionCookieOptions(expiresAt));
    return response;
  } catch (err) {
    if (err instanceof AuthError) {
      return redirectWithError(origin, err.message);
    }
    return redirectWithError(origin, "Không thể đăng nhập bằng Google. Vui lòng thử lại.");
  }
}
