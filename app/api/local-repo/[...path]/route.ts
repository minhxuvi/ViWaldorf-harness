import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import {
  getLocalEarthRepoDir,
  getLocalGenesisRepoDir,
  resolveSafeLocalRepoFile,
} from "@/lib/server/localRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const repo = _request.nextUrl.searchParams.get("repo");
  const customRoot =
    repo === "earth" ? getLocalEarthRepoDir() : getLocalGenesisRepoDir();
  const resolved = resolveSafeLocalRepoFile(pathSegments, customRoot);

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
