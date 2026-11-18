import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { createFeedbackThread, listFeedbackThreads } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const includeMessages = request.nextUrl.searchParams.get("includeMessages") === "1";
  const threads = listFeedbackThreads({ status, includeMessages });
  return NextResponse.json({ data: threads });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để gửi góp ý." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      title?: string;
      body?: string;
      chapterRef?: string | null;
    };
    const title = String(payload.title || "").trim();
    const body = String(payload.body || "").trim();

    if (!title || title.length > 255) {
      return NextResponse.json(
        { error: "Tiêu đề góp ý không được để trống (tối đa 255 ký tự)." },
        { status: 422 }
      );
    }
    if (!body || body.length > 5000) {
      return NextResponse.json(
        { error: "Nội dung góp ý không được để trống (tối đa 5000 ký tự)." },
        { status: 422 }
      );
    }

    const thread = createFeedbackThread({
      userId: Number(user.id),
      title,
      body,
      chapterRef: typeof payload.chapterRef === "string" ? payload.chapterRef : null,
    });
    return NextResponse.json({ data: thread }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không thể gửi góp ý lúc này." }, { status: 400 });
  }
}
