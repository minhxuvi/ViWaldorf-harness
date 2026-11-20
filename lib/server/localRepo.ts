import fs from "node:fs";
import path from "node:path";

const ALLOWED_EXTENSIONS: Record<string, string> = {
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
};

/**
 * Resolves the root directory of the sibling `from-genesis-to-nativity` repository
 * for pre-push local verification.
 */
export function getLocalGenesisRepoDir(customDir?: string): string {
  const configured =
    customDir || process.env.GENESIS_LOCAL_REPO_DIR || "../from-genesis-to-nativity";
  return path.resolve(process.cwd(), configured);
}

export function getLocalEarthRepoDir(customDir?: string): string {
  const configured =
    customDir || process.env.EARTH_LOCAL_REPO_DIR || "../de-dat-de-nuoc";
  return path.resolve(process.cwd(), configured);
}

/**
 * Validates and resolves a safe file path inside the local story repository.
 * Blocks path traversal, hidden files, and private directories.
 */
export function resolveSafeLocalRepoFile(
  segments: readonly string[],
  customRootDir?: string
): { filePath: string; contentType: string } | null {
  if (!Array.isArray(segments) || segments.length === 0) {
    return null;
  }

  for (const seg of segments) {
    if (
      !seg ||
      seg === "." ||
      seg === ".." ||
      seg.startsWith(".") ||
      seg === "private" ||
      seg.includes("/") ||
      seg.includes("\\") ||
      seg.includes("\0")
    ) {
      return null;
    }
  }

  const relPath = segments.join("/");
  const isAllowedPrefix =
    relPath === "languages.json" ||
    relPath === "README.md" ||
    relPath.startsWith("locales/") ||
    relPath.startsWith("assets/images/");

  if (!isAllowedPrefix) {
    return null;
  }

  const ext = path.extname(relPath).toLowerCase();
  const contentType = ALLOWED_EXTENSIONS[ext];
  if (!contentType) {
    return null;
  }

  const rootDir = getLocalGenesisRepoDir(customRootDir);
  const resolved = path.resolve(rootDir, ...segments);
  const rootPrefix = rootDir.endsWith(path.sep) ? rootDir : `${rootDir}${path.sep}`;

  if (!resolved.startsWith(rootPrefix)) {
    return null;
  }

  try {
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      return null;
    }
  } catch {
    return null;
  }

  return { filePath: resolved, contentType };
}
