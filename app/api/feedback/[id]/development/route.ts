import { NextRequest, NextResponse } from "next/server";
import { verifyFeedbackBearerToken } from "@/lib/server/auth";
import {
  FeedbackActionError,
  FeedbackDevelopmentPatch,
  updateFeedbackDevelopment,
} from "@/lib/server/db";

export const runtime = "nodejs";

export async function PATCH(
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
    const patch = (await request.json()) as FeedbackDevelopmentPatch;
    const thread = updateFeedbackDevelopment(threadId, patch);
    return NextResponse.json({
      status: "ok",
      threadId: thread.id,
      threadStatus: thread.status,
      development: thread.development,
    });
  } catch (err) {
    if (err instanceof FeedbackActionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
