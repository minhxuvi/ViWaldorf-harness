import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies, isGoogleOAuthConfigured } from "@/lib/server/auth";
import { getUserReadingProgress, toPublicAuthUser } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromCookies();
    const googleOAuthConfigured = isGoogleOAuthConfigured(request.nextUrl.origin);

    if (!user) {
      return NextResponse.json({
        user: null,
        readingProgress: null,
        googleOAuthConfigured,
      });
    }

    const readingProgress = getUserReadingProgress(Number(user.id));
    return NextResponse.json({
      user: toPublicAuthUser(user),
      readingProgress,
      googleOAuthConfigured,
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json(
      { user: null, readingProgress: null, googleOAuthConfigured: false },
      { status: 500 }
    );
  }
}
