import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { getUserReadingProgress, saveUserReadingProgress } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  const readingProgress = getUserReadingProgress(Number(user.id));
  return NextResponse.json({ readingProgress });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { readingProgress?: unknown };
    const saved = saveUserReadingProgress(Number(user.id), body.readingProgress ?? body);
    if (!saved) {
      return NextResponse.json({ error: "Dữ liệu tiến độ không hợp lệ." }, { status: 422 });
    }
    return NextResponse.json({ readingProgress: saved });
  } catch {
    return NextResponse.json({ error: "Không thể lưu tiến độ đọc." }, { status: 400 });
  }
}
