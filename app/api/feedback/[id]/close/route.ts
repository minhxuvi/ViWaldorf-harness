import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/server/auth";
import { closeFeedbackThread, FeedbackActionError } from "@/lib/server/db";

export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  }

  const { id } = await context.params;
  const threadId = Number(id);
  if (!Number.isInteger(threadId) || threadId <= 0) {
    return NextResponse.json({ error: "Mã góp ý không hợp lệ." }, { status: 404 });
  }

  try {
    const thread = closeFeedbackThread({ threadId, userId: Number(user.id) });
    return NextResponse.json({ data: thread });
  } catch (err) {
    if (err instanceof FeedbackActionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Không thể đóng góp ý." }, { status: 400 });
  }
}
