import { NextRequest, NextResponse } from "next/server";

// In-memory serverless cache for fast response (can be backed by Vercel KV or Upstash)
const syncStore = new Map<string, { payload: string; updatedAt: string; version: number }>();

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token =
    request.nextUrl.searchParams.get("token") ||
    (authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "");

  if (!token) {
    return NextResponse.json(
      { error: "Missing sync token in authorization header or query parameter." },
      { status: 401 }
    );
  }

  const record = syncStore.get(token);
  if (!record) {
    return NextResponse.json(
      { status: "empty", message: "No cloud sync payload found for this passkey token." },
      { status: 200 }
    );
  }

  return NextResponse.json({
    status: "ok",
    payload: record.payload,
    updatedAt: record.updatedAt,
    version: record.version,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization") || "";
    const token =
      body.token ||
      (authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "");

    if (!token) {
      return NextResponse.json(
        { error: "Missing sync token in request." },
        { status: 401 }
      );
    }

    if (!body.payload) {
      return NextResponse.json(
        { error: "Missing sync payload in request body." },
        { status: 400 }
      );
    }

    const current = syncStore.get(token);
    const newVersion = (current?.version || 0) + 1;
    const now = new Date().toISOString();

    syncStore.set(token, {
      payload: body.payload,
      updatedAt: now,
      version: newVersion,
    });

    return NextResponse.json({
      status: "ok",
      version: newVersion,
      syncedAt: now,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON or server error: " + error.message },
      { status: 500 }
    );
  }
}
