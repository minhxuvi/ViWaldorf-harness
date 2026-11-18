import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { resolveSafeLocalRepoFile } from "@/lib/server/localRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const resolved = resolveSafeLocalRepoFile(pathSegments);

  if (!resolved) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(resolved.filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": resolved.contentType,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("GET /api/local-repo error:", err);
    return NextResponse.json({ error: "Failed to read local repo file" }, { status: 500 });
  }
}
