import { NextRequest, NextResponse } from "next/server";
import { getFeedbackThreadById } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const threadId = Number(id);
  if (!Number.isInteger(threadId) || threadId <= 0) {
    return NextResponse.json({ error: "Mã góp ý không hợp lệ." }, { status: 404 });
  }

  const thread = getFeedbackThreadById(threadId);
  if (!thread) {
    return NextResponse.json({ error: "Không tìm thấy góp ý này." }, { status: 404 });
  }

  return NextResponse.json({ data: thread });
}
