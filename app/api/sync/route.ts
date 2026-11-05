import { NextRequest, NextResponse } from "next/server";

// In-memory serverless cache with capacity boundary (can be backed by Vercel KV or Upstash)
const MAX_SYNC_ENTRIES = 500;
const syncStore = new Map<string, { payload: string; updatedAt: string; version: number }>();

function isValidToken(token: string): boolean {
  return /^[a-zA-Z0-9_-]{16,128}$/.test(token);
}

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

  if (!isValidToken(token)) {
    return NextResponse.json(
      { error: "Invalid sync token format. Expected 16-128 alphanumeric characters." },
      { status: 400 }
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

    if (!isValidToken(token)) {
      return NextResponse.json(
        { error: "Invalid sync token format." },
        { status: 400 }
      );
    }

    if (!body.payload || typeof body.payload !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid sync payload in request body." },
        { status: 400 }
      );
    }

    // Reject payloads larger than 5MB
    if (body.payload.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload exceeds 5MB size limit." },
        { status: 413 }
      );
    }

    // Evict oldest entry if capacity limit reached to prevent memory leak
    if (syncStore.size >= MAX_SYNC_ENTRIES && !syncStore.has(token)) {
      const oldestKey = syncStore.keys().next().value;
      if (oldestKey) syncStore.delete(oldestKey);
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
