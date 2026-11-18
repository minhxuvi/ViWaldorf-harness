import { NextRequest, NextResponse } from "next/server";
import { verifyFeedbackBearerToken } from "@/lib/server/auth";
import {
  createFeedbackReply,
  FeedbackActionError,
  getEditorialUser,
} from "@/lib/server/db";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyFeedbackBearerToken(request.headers.get("authorization"))) {
    return NextResponse.json(
      { error: "Invalid or missing feedback API token." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const threadId = Number(id);
  if (!Number.isInteger(threadId) || threadId <= 0) {
    return NextResponse.json({ error: "Feedback thread not found." }, { status: 404 });
  }

  try {
    const payload = (await request.json()) as { body?: string };
    const body = String(payload.body || "").trim();
    if (!body || body.length > 5000) {
      return NextResponse.json(
        { error: "Body is required (max 5000 chars)." },
        { status: 422 }
      );
    }

    const editorial = getEditorialUser();
    const { thread, message } = createFeedbackReply({
      threadId,
      userId: Number(editorial.id),
      body,
      isEditorialResponse: true,
    });

    return NextResponse.json(
      {
        status: "ok",
        threadId: thread.id,
        threadStatus: thread.status,
        development: thread.development,
        message,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof FeedbackActionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
