import {
  AgeVariantId,
  AncientBookItem,
  PronunciationGuideItem,
  SceneDetailedOutline,
  SceneLevelPaths,
  SceneVariantContent,
  StoryBookMeta,
  StoryScene,
  StorySoulContext,
  WaldorfArtStyle,
  WaldorfStory,
} from "./types";

export const GENESIS_REPO_OWNER = "xuvivn";
export const GENESIS_REPO_NAME = "from-genesis-to-nativity";
export const GENESIS_REPO_BRANCH = "main";
export const GENESIS_REPO_URL = `https://github.com/${GENESIS_REPO_OWNER}/${GENESIS_REPO_NAME}`;
export const GENESIS_RAW_BASE_URL = `https://raw.githubusercontent.com/${GENESIS_REPO_OWNER}/${GENESIS_REPO_NAME}/${GENESIS_REPO_BRANCH}`;
export const GENESIS_JSDELIVR_BASE_URL = `https://cdn.jsdelivr.net/gh/${GENESIS_REPO_OWNER}/${GENESIS_REPO_NAME}@${GENESIS_REPO_BRANCH}`;
export const GENESIS_STORY_ID = "story-from-genesis-to-nativity";

export const REPO_SYNC_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
export const REPO_MANUAL_COOLDOWN_MS = 15 * 1000; // 15 seconds
export const REPO_FETCH_CONCURRENCY = 6;

export function shouldAutoSyncRepo(lastSyncedAt?: string, nowMs = Date.now()): boolean {
  if (!lastSyncedAt) return true;
  const parsedMs = Date.parse(lastSyncedAt);
  if (Number.isNaN(parsedMs)) return true;
  return nowMs - parsedMs >= REPO_SYNC_TTL_MS;
}

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const safeLimit = Math.max(1, Math.min(items.length, Math.floor(limit)));
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await worker(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: safeLimit }, () => runWorker()));
  return results;
}

export function getCandidateRepoBaseUrls(preferredBaseUrl?: string): string[] {
  const defaults = [GENESIS_JSDELIVR_BASE_URL, GENESIS_RAW_BASE_URL];
  if (!preferredBaseUrl || preferredBaseUrl === GENESIS_RAW_BASE_URL) {
    return defaults;
  }
  return Array.from(new Set([preferredBaseUrl, ...defaults]));
}

interface RepoIndexLevel0 {
  overview_file?: string;
  ancient_books?: AncientBookItem[];
}

interface RepoIndexBook {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  is_epilogue: boolean;
  illustration_style: string;
}

interface RepoIndexScene {
  id: string;
  number: number;
  slug: string;
  title: string;
  book_id: string;
  is_epilogue: boolean;
  image: string;
  image_generated: boolean;
  levels: {
    level_0: {
      overview: string;
      book: string;
    };
    level_1: Record<AgeVariantId, string>;
    level_2: Record<AgeVariantId, string>;
    level_3: string;
    level_4: {
      gallery: string;
      image: string;
      prompt_spec: string;
    };
  };
}

export interface RepoStoryIndex {
  title: string;
  language: string;
  total_books: number;
  total_scenes: number;
  levels: [RepoIndexLevel0, ...unknown[]];
  books: RepoIndexBook[];
  scenes: RepoIndexScene[];
}

export interface ParsedLevel1Scene {
  slug: string;
  title: string;
  passage: string;
  voiceNote: string;
}

export function cleanInlineMarkdown(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripTrailingRule(text: string): string {
  return text.replace(/(?:\n|\r\n)*---+\s*$/g, "").trim();
}

function splitTopLevelCommas(text: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")" && depth > 0) depth--;

    if ((ch === "," || ch === ";") && depth === 0) {
      const trimmed = current.trim().replace(/\.$/, "");
      if (trimmed) result.push(trimmed);
      current = "";
    } else {
      current += ch;
    }
  }

  const tail = current.trim().replace(/\.$/, "");
  if (tail) result.push(tail);
  return result;
}

function splitBySceneHeader(markdown: string, headingPrefix: "##" | "###") {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const escaped = headingPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headerRegex = new RegExp(
    `^${escaped}\\s+Phân cảnh\\s+\\d+\\s*\\(\`([^\`]+)\`\\):\\s*(.+)$`,
    "gm"
  );

  const matches: Array<{ slug: string; title: string; start: number; bodyStart: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(normalized)) !== null) {
    matches.push({
      slug: m[1].trim(),
      title: m[2].trim(),
      start: m.index,
      bodyStart: m.index + m[0].length,
    });
  }

  return matches.map((entry, idx) => {
    const nextStart = idx + 1 < matches.length ? matches[idx + 1].start : normalized.length;
    const rawBody = normalized.slice(entry.bodyStart, nextStart);
    // Cắt phần tiêu đề Quyển (# Quyển ...) nếu nằm cuối block trước scene tiếp theo
    const withoutNextBookHeader = rawBody.replace(/\n+#\s+Quyển\s+[^\n]+[\s\S]*$/m, "");
    return {
      slug: entry.slug,
      title: entry.title,
      body: stripTrailingRule(withoutNextBookHeader),
    };
  });
}

export function parseLevel0BookMarkdown(markdown: string): StorySoulContext {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const sections = normalized.split(/^##\s+/m);

  let culturalSpirit = "";
  let storytellingRhythm = "";
  let ageMetaphor = "";
  const ageMetaphors: Partial<Record<AgeVariantId, string>> = {};
  const pronunciations: PronunciationGuideItem[] = [];

  for (const sec of sections) {
    const firstNewline = sec.indexOf("\n");
    if (firstNewline === -1) continue;
    const heading = sec.slice(0, firstNewline).trim();
    const content = stripTrailingRule(sec.slice(firstNewline + 1));

    if (/^1\./.test(heading)) {
      culturalSpirit = cleanInlineMarkdown(content);
    } else if (/^2\./.test(heading)) {
      storytellingRhythm = cleanInlineMarkdown(
        content
          .split("\n")
          .map((line) => line.replace(/^-\s+/, "• "))
          .join("\n")
      );
    } else if (/^3\./.test(heading)) {
      const subBlocks = content.split(/^###\s+/m).filter((b) => b.trim().length > 0);
      for (const sub of subBlocks) {
        const subNl = sub.indexOf("\n");
        if (subNl === -1) continue;
        const subHeading = sub.slice(0, subNl).trim();
        const subBody = cleanInlineMarkdown(
          sub
            .slice(subNl + 1)
            .split("\n")
            .map((line) => line.replace(/^-\s+/, "• "))
            .join("\n")
        );
        if (subHeading.includes("3–5") || subHeading.includes("3-5")) {
          ageMetaphors["3-5"] = subBody;
        } else if (subHeading.includes("6–10") || subHeading.includes("6-10")) {
          ageMetaphors["6-10"] = subBody;
        } else if (subHeading.includes("11+")) {
          ageMetaphors["11+"] = subBody;
        }
      }
      ageMetaphor =
        ageMetaphors["6-10"] ||
        ageMetaphors["3-5"] ||
        ageMetaphors["11+"] ||
        cleanInlineMarkdown(content);
    } else if (/^4\./.test(heading)) {
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("|")) continue;
        if (trimmed.includes(":---") || trimmed.includes("---")) continue;
        const cells = trimmed
          .split("|")
          .slice(1, -1)
          .map((c) => cleanInlineMarkdown(c));
        if (cells.length >= 3 && !cells[0].toLowerCase().includes("tên trong văn bản")) {
          pronunciations.push({
            term: cells[0],
            pronunciation: cells[1],
            meaning: cells[2],
          });
        }
      }
    }
  }

  return {
    culturalSpirit: culturalSpirit || "Đang đồng bộ tinh thần văn hóa từ kho sử thi.",
    storytellingRhythm: storytellingRhythm || "Nhịp kể khoan thai, lắng sâu theo từng phân cảnh.",
    ageMetaphor: ageMetaphor || "Thông điệp ẩn dụ nuôi dưỡng tâm hồn trẻ thơ.",
    ageMetaphors,
    pronunciations,
  };
}

export function parseLevel1Markdown(markdown: string): Record<string, ParsedLevel1Scene> {
  const blocks = splitBySceneHeader(markdown, "##");
  const result: Record<string, ParsedLevel1Scene> = {};

  for (const block of blocks) {
    const voiceSplit = block.body.split(/^###\s+Lưu ý giọng kể[^\n]*$/m);
    const rawPassage = stripTrailingRule(voiceSplit[0] || "");
    const rawVoiceNote = stripTrailingRule(voiceSplit[1] || "");

    const passage = rawPassage
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const voiceNote = cleanInlineMarkdown(
      rawVoiceNote
        .split("\n")
        .map((line) => line.replace(/^-\s+/, "• "))
        .join("\n")
    );

    result[block.slug] = {
      slug: block.slug,
      title: block.title,
      passage: passage || block.title,
      voiceNote:
        voiceNote || "Giữ giọng kể tự nhiên, rõ ràng và ngắt nhịp nhẹ nhàng theo từng hình ảnh.",
    };
  }

  return result;
}

export function parseLevel2Markdown(markdown: string): Record<string, SceneDetailedOutline> {
  const blocks = splitBySceneHeader(markdown, "##");
  const result: Record<string, SceneDetailedOutline> = {};

  for (const block of blocks) {
    const lines = block.body.split("\n");
    let currentKey = "";
    const topSections: Record<string, string[]> = {};

    for (const rawLine of lines) {
      const topMatch = rawLine.match(/^-\s+\*\*([^*]+)\*\*\s*(.*)$/);
      if (topMatch) {
        currentKey = topMatch[1].replace(/:$/, "").trim().toLowerCase();
        topSections[currentKey] = [];
        if (topMatch[2].trim()) {
          topSections[currentKey].push(topMatch[2].trim());
        }
        continue;
      }

      if (currentKey) {
        const trimmed = rawLine.trim();
        if (trimmed) {
          topSections[currentKey].push(trimmed);
        }
      }
    }

    let characters: string[] = [];
    const localizedDetails: string[] = [];
    let emotionalRhythm = "";
    const beats: string[] = [];

    for (const [key, valueLines] of Object.entries(topSections)) {
      const joinedClean = cleanInlineMarkdown(valueLines.join(" "));

      if (key.includes("nhân vật")) {
        const items = splitTopLevelCommas(joinedClean);
        characters = items.slice(0, 14);
      } else if (key.includes("điệp khúc") || key.includes("refrain")) {
        localizedDetails.push(`Điệp khúc: ${joinedClean}`);
      } else if (key.includes("tương tác") || key.includes("cử chỉ")) {
        localizedDetails.push(`Cử chỉ minh họa: ${joinedClean}`);
      } else if (key.includes("bối cảnh")) {
        localizedDetails.push(`Bối cảnh & Tâm thức: ${joinedClean}`);
      } else if (key.includes("diễn biến") || key.includes("mạch kể")) {
        for (const l of valueLines) {
          const subMatch = l.match(/^-\s+(.+)$/);
          if (subMatch) {
            beats.push(cleanInlineMarkdown(subMatch[1]));
          } else if (l && !l.startsWith("#")) {
            beats.push(cleanInlineMarkdown(l));
          }
        }
      } else if (
        key.includes("ý nghĩa") ||
        key.includes("điểm nhấn") ||
        key.includes("chiều sâu")
      ) {
        emotionalRhythm = joinedClean;
      }
    }

    if (characters.length === 0) {
      // Thử trích tên nhân vật được in nghiêng (*Michael*, *Adam*...) từ nội dung
      const italicNames = Array.from(block.body.matchAll(/\*([A-ZÀ-Ỹ][^*]{1,28})\*/g)).map((m) =>
        m[1].trim()
      );
      characters = Array.from(new Set(italicNames)).slice(0, 8);
      if (characters.length === 0) {
        characters = [block.title];
      }
    }

    if (localizedDetails.length === 0) {
      if (characters.length > 0) {
        localizedDetails.push(...characters.slice(0, 4));
      }
      if (emotionalRhythm) {
        localizedDetails.push(emotionalRhythm);
      }
    }

    if (!emotionalRhythm) {
      emotionalRhythm =
        localizedDetails[0] || `Giữ nhịp kể ấm áp, lắng sâu cho phân cảnh "${block.title}".`;
    }

    if (beats.length === 0) {
      beats.push(cleanInlineMarkdown(block.body));
    }

    result[block.slug] = {
      characters,
      localizedDetails: localizedDetails.slice(0, 6),
      emotionalRhythm,
      beats,
    };
  }

  return result;
}

export function parseLevel3Markdown(markdown: string): Record<string, string[]> {
  const blocks = splitBySceneHeader(markdown, "###");
  const result: Record<string, string[]> = {};

  for (const block of blocks) {
    const points = block.body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .map((l) => cleanInlineMarkdown(l.slice(2)));
    if (points.length > 0) {
      result[block.slug] = points;
    }
  }

  return result;
}

function mapIllustrationStyle(rawStyle: string, bookNumber: number): WaldorfArtStyle {
  if (rawStyle.includes("charcoal") || bookNumber === 1) return "chalkboard";
  if (rawStyle.includes("watercolor") || rawStyle.includes("sepia")) return "wet-on-wet";
  return "crayon";
}

async function fetchTextSafe(
  url: string,
  cacheMode: RequestCache = "default"
): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: cacheMode });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchTextWithFallback(
  relativePath: string,
  baseUrls: readonly string[],
  cacheMode: RequestCache
): Promise<string | null> {
  for (const baseUrl of baseUrls) {
    const content = await fetchTextSafe(buildRepoFileUrl(relativePath, baseUrl), cacheMode);
    if (content !== null) {
      return content;
    }
  }
  return null;
}

export function buildRepoFileUrl(
  relativePath: string,
  rawBaseUrl = GENESIS_JSDELIVR_BASE_URL
): string {
  const cleanPath = relativePath.replace(/^\/+/, "");
  return `${rawBaseUrl}/${cleanPath}`;
}

export function buildGitHubBlobUrl(
  relativePath: string,
  repoUrl = GENESIS_REPO_URL,
  branch = GENESIS_REPO_BRANCH
): string {
  const cleanPath = relativePath.replace(/^\/+/, "");
  return `${repoUrl}/blob/${branch}/${cleanPath}`;
}

export async function fetchAncientBookMarkdown(
  relativePath: string,
  rawBaseUrl = GENESIS_JSDELIVR_BASE_URL,
  options?: { preferFresh?: boolean }
): Promise<string> {
  const cacheMode: RequestCache = options?.preferFresh ? "no-cache" : "default";
  const candidateBases = getCandidateRepoBaseUrls(rawBaseUrl);
  let lastStatus = 0;

  for (const base of candidateBases) {
    try {
      const res = await fetch(buildRepoFileUrl(relativePath, base), { cache: cacheMode });
      if (res.ok) {
        return await res.text();
      }
      lastStatus = res.status;
    } catch {
      // Thử CDN dự phòng tiếp theo
    }
  }

  throw new Error(
    `Không thể tải tệp văn bản cổ${lastStatus ? ` (${lastStatus})` : ""}: ${relativePath}`
  );
}

export async function fetchGenesisStoryFromRepo(
  rawBaseUrl = GENESIS_JSDELIVR_BASE_URL,
  options?: { preferFresh?: boolean }
): Promise<WaldorfStory> {
  const cacheMode: RequestCache = options?.preferFresh ? "no-cache" : "default";
  const candidateBases = getCandidateRepoBaseUrls(rawBaseUrl);
  let indexData: RepoStoryIndex | null = null;
  let activeBaseUrl = candidateBases[0];
  let lastStatus = 0;

  for (const base of candidateBases) {
    try {
      const indexRes = await fetch(buildRepoFileUrl("story-index.json", base), {
        cache: cacheMode,
      });
      if (indexRes.ok) {
        indexData = (await indexRes.json()) as RepoStoryIndex;
        activeBaseUrl = base;
        break;
      }
      lastStatus = indexRes.status;
    } catch {
      // Thử CDN dự phòng tiếp theo
    }
  }

  if (!indexData) {
    throw new Error(
      `Không thể đọc story-index.json từ CDN/Repo${lastStatus ? ` (${lastStatus})` : ""}`
    );
  }

  const level0Config = indexData.levels?.[0] || {};
  const overviewPath =
    level0Config.overview_file || "level-0-khong-gian-boi-canh/00-tong-quan-linh-hon-su-thi.md";
  const ancientBooks = level0Config.ancient_books || [];

  // Gom toàn bộ đường dẫn duy nhất từ story-index.json để tải trực tiếp theo folder path
  const level0BookFiles = new Set<string>();
  const level1Files = new Set<string>();
  const level2Files = new Set<string>();
  let level3File = "level-3-dan-y-tom-tat/dan-y-tom-tat-28-phan-canh.md";

  for (const sc of indexData.scenes) {
    if (sc.levels?.level_0?.book) level0BookFiles.add(sc.levels.level_0.book);
    if (sc.levels?.level_1) {
      Object.values(sc.levels.level_1).forEach((p) => p && level1Files.add(p));
    }
    if (sc.levels?.level_2) {
      Object.values(sc.levels.level_2).forEach((p) => p && level2Files.add(p));
    }
    if (sc.levels?.level_3) {
      level3File = sc.levels.level_3;
    }
  }

  const allPaths = Array.from(
    new Set([overviewPath, ...level0BookFiles, ...level1Files, ...level2Files, level3File])
  );
  const orderedBases = [activeBaseUrl, ...candidateBases.filter((b) => b !== activeBaseUrl)];

  const fileCache: Record<string, string> = {};
  await mapWithConcurrency(allPaths, REPO_FETCH_CONCURRENCY, async (relPath) => {
    const content = await fetchTextWithFallback(relPath, orderedBases, cacheMode);
    if (content !== null) {
      fileCache[relPath] = content;
    }
  });

  const bookSouls: Record<string, StorySoulContext> = {};
  const booksMeta: StoryBookMeta[] = indexData.books.map((bk) => {
    const sampleSceneForBook = indexData.scenes.find((s) => s.book_id === bk.id);
    const level0File =
      sampleSceneForBook?.levels?.level_0?.book || `level-0-khong-gian-boi-canh/${bk.slug}.md`;
    if (fileCache[level0File]) {
      bookSouls[bk.id] = parseLevel0BookMarkdown(fileCache[level0File]);
    }
    return {
      id: bk.id,
      number: bk.number,
      slug: bk.slug,
      title: bk.title,
      subtitle: bk.subtitle,
      isEpilogue: Boolean(bk.is_epilogue),
      illustrationStyle: bk.illustration_style,
      level0File,
    };
  });

  // Phân tích Level 1 & Level 2 theo từng đường dẫn đã tải
  const parsedL1ByFile: Record<string, Record<string, ParsedLevel1Scene>> = {};
  for (const p of level1Files) {
    if (fileCache[p]) parsedL1ByFile[p] = parseLevel1Markdown(fileCache[p]);
  }

  const parsedL2ByFile: Record<string, Record<string, SceneDetailedOutline>> = {};
  for (const p of level2Files) {
    if (fileCache[p]) parsedL2ByFile[p] = parseLevel2Markdown(fileCache[p]);
  }

  const level3Map = fileCache[level3File] ? parseLevel3Markdown(fileCache[level3File]) : {};

  const variantsOrder: AgeVariantId[] = ["6-10", "3-5", "11+"];
  const scenes: StoryScene[] = indexData.scenes.map((sc) => {
    const bookMeta = booksMeta.find((b) => b.id === sc.book_id);
    const variants: Partial<Record<AgeVariantId, SceneVariantContent>> = {};

    for (const v of variantsOrder) {
      const l1Path = sc.levels?.level_1?.[v];
      const l2Path = sc.levels?.level_2?.[v];
      const l1Scene = l1Path ? parsedL1ByFile[l1Path]?.[sc.slug] : undefined;
      const l2Outline = l2Path ? parsedL2ByFile[l2Path]?.[sc.slug] : undefined;

      if (l1Scene || l2Outline) {
        variants[v] = {
          passage: l1Scene?.passage || sc.title,
          voiceNote:
            l1Scene?.voiceNote ||
            "Giữ nhịp kể ấm áp, rõ ràng và tạm dừng nhẹ giữa các hình ảnh chính.",
          detailedOutline: l2Outline || {
            characters: [sc.title],
            localizedDetails: [bookMeta?.subtitle || sc.title],
            emotionalRhythm: "Khoan thai, trang trọng và giàu hình ảnh sống động.",
            beats: level3Map[sc.slug] || [sc.title],
          },
        };
      }
    }

    const defaultVariant = variants["6-10"] || variants["3-5"] || variants["11+"];
    const summaryPoints =
      level3Map[sc.slug] ||
      defaultVariant?.detailedOutline.beats.slice(0, 5) || [
        `Mở đầu phân cảnh ${sc.number}: ${sc.title}.`,
      ];

    const levelPaths: SceneLevelPaths = {
      level0Overview: sc.levels?.level_0?.overview || overviewPath,
      level0Book: sc.levels?.level_0?.book || bookMeta?.level0File || "",
      level1: {
        "6-10": sc.levels?.level_1?.["6-10"] || "",
        "3-5": sc.levels?.level_1?.["3-5"] || "",
        "11+": sc.levels?.level_1?.["11+"] || "",
      },
      level2: {
        "6-10": sc.levels?.level_2?.["6-10"] || "",
        "3-5": sc.levels?.level_2?.["3-5"] || "",
        "11+": sc.levels?.level_2?.["11+"] || "",
      },
      level3: sc.levels?.level_3 || level3File,
      level4Gallery: sc.levels?.level_4?.gallery || "level-4-tranh-goi-nho/bo-tranh-goi-nho.md",
      level4Image: sc.levels?.level_4?.image || sc.image,
      level4PromptSpec:
        sc.levels?.level_4?.prompt_spec || "level-4-tranh-goi-nho/prompts-28-phan-canh.md",
    };

    return {
      id: sc.id,
      ord: sc.number,
      slug: sc.slug,
      bookId: sc.book_id,
      isEpilogue: sc.is_epilogue,
      title: `Phân cảnh ${sc.number.toString().padStart(2, "0")}: ${sc.title}`,
      passage: defaultVariant?.passage || sc.title,
      voiceNote:
        defaultVariant?.voiceNote ||
        "Giữ nhịp kể ấm áp, rõ ràng và tạm dừng nhẹ giữa các hình ảnh.",
      detailedOutline: defaultVariant?.detailedOutline || {
        characters: [sc.title],
        localizedDetails: [bookMeta?.subtitle || sc.title],
        emotionalRhythm: "Khoan thai, giàu hình ảnh.",
        beats: summaryPoints,
      },
      variants,
      summaryPoints,
      artStyle: mapIllustrationStyle(bookMeta?.illustrationStyle || "", bookMeta?.number || 1),
      repoImage: sc.image,
      imageGenerated: Boolean(sc.image_generated),
      levelPaths,
    };
  });

  const primarySoul = bookSouls["quyen-1"] || Object.values(bookSouls)[0] || {
    culturalSpirit:
      "Đại sử thi 5 Quyển (28 phân cảnh) kết nối từ Khởi Nguyên Sáng Thế đến Đêm Giáng Sinh và Ngoại truyện Ông già Noel.",
    storytellingRhythm:
      "Nhịp kể mở rộng theo hơi thở lứa tuổi: nhẹ nhàng như lời ru (3–5), giàu hình tượng bản địa hóa (6–10) và sâu lắng triết lý (11+).",
    ageMetaphor:
      "Hành trình tìm ánh sáng nội tâm, lòng kiên trung và tình thương trao đi không vụ lợi.",
    pronunciations: [
      { term: "Michael", pronunciation: "Mi-kha-en", meaning: "Tổng lãnh thiên thần ánh sáng" },
      { term: "Adam", pronunciation: "A-đam", meaning: "Con người đầu tiên từ đất ấm" },
      { term: "Noah", pronunciation: "Nô-ê", meaning: "Người đóng Con Tàu giao ước" },
    ],
  };

  return {
    id: GENESIS_STORY_ID,
    title: indexData.title || "Từ Sáng Thế Đến Giáng Sinh — Bộ Sử Thi Luyện Kể Chuyện 5 Cấp Độ",
    titleEn: "From Genesis to Nativity — 5-Level Storytelling Epic",
    sourceInfo: `Nguồn trực tiếp từ repo xuvivn/from-genesis-to-nativity · ${indexData.total_books} Quyển · ${indexData.total_scenes} phân cảnh`,
    ageRange: "3–5, 6–10 & 11+ tuổi",
    goal: "Luyện kể trọn mạch sử thi 5 Quyển (28 phân cảnh) trực tiếp theo folder path Level 0 → Level 4.",
    defaultArtStyle: "chalkboard",
    repoUrl: GENESIS_REPO_URL,
    rawBaseUrl: activeBaseUrl,
    lastSyncedAt: new Date().toISOString(),
    books: booksMeta,
    soul: {
      ...primarySoul,
      overviewMarkdown: fileCache[overviewPath] || undefined,
      overviewPath,
      bookSouls,
      ancientBooks,
    },
    scenes,
  };
}
