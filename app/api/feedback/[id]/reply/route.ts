import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { createFeedbackReply, FeedbackActionError } from "@/lib/server/db";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để trả lời." }, { status: 401 });
  }

  const { id } = await context.params;
  const threadId = Number(id);
  if (!Number.isInteger(threadId) || threadId <= 0) {
    return NextResponse.json({ error: "Mã góp ý không hợp lệ." }, { status: 404 });
  }

  try {
    const payload = (await request.json()) as { body?: string };
    const body = String(payload.body || "").trim();
    if (!body || body.length > 5000) {
      return NextResponse.json(
        { error: "Nội dung phản hồi không được để trống (tối đa 5000 ký tự)." },
        { status: 422 }
      );
    }

    const result = createFeedbackReply({
      threadId,
      userId: Number(user.id),
      body,
    });
    return NextResponse.json({ data: result.thread, message: result.message }, { status: 201 });
  } catch (err) {
    if (err instanceof FeedbackActionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Không thể gửi phản hồi." }, { status: 400 });
  }
}
