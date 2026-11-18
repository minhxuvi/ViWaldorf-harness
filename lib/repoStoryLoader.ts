import {
  AncientBookItem,
  PronunciationGuideItem,
  SceneDetailedOutline,
  SceneLevelPaths,
  StoryBookMeta,
  StoryIllustration,
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
  level?: number;
  overview_file?: string;
  ancient_books?: AncientBookItem[];
}

interface RepoIndexLevel3 {
  level?: number;
  file?: string;
}

interface RepoIndexLevel4 {
  level?: number;
  gallery_file?: string;
  prompt_spec_file?: string;
}

interface RepoIndexBook {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  is_epilogue: boolean;
  illustration_style: string;
  total_chapters: number;
  level_0_file: string;
  level_1_file: string;
  level_2_file: string;
}

interface RepoIndexIllustration {
  id: string;
  number: number;
  book_id: string;
  chapters_ref: string;
  title: string;
  image: string;
  image_generated: boolean;
}

interface RepoIndexChapter {
  id: string;
  global_number: number;
  book_id: string;
  chapter_number: number;
  section?: string;
  title: string;
  is_epilogue: boolean;
  illustration_id: string;
  image: string;
  levels: {
    level_0?: {
      overview?: string;
      book?: string;
    };
    level_1?: string;
    level_2?: string;
    level_3?: string;
    level_4?: {
      gallery?: string;
      image?: string;
      prompt_spec?: string;
    };
  };
}

export interface RepoStoryIndex {
  title: string;
  language: string;
  target_age?: string;
  style_reference?: string;
  total_books: number;
  total_chapters: number;
  total_illustrations: number;
  levels?: [RepoIndexLevel0?, unknown?, unknown?, RepoIndexLevel3?, RepoIndexLevel4?];
  books: RepoIndexBook[];
  illustrations: RepoIndexIllustration[];
  chapters: RepoIndexChapter[];
}

export interface ParsedLevel1Chapter {
  chapterNumber: number;
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

const PASSAGE_PAGE_BUDGETS: Record<"sm" | "md" | "lg", { first: number; other: number }> = {
  sm: { first: 600, other: 800 },
  md: { first: 450, other: 650 },
  lg: { first: 340, other: 480 },
};

/**
 * Splits a chapter passage into screen-sized reading pages along paragraph and sentence boundaries.
 */
export function paginatePassage(
  passage: string,
  textSize: "sm" | "md" | "lg" = "md"
): string[] {
  const normalized = passage.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [""];

  const budget = PASSAGE_PAGE_BUDGETS[textSize] || PASSAGE_PAGE_BUDGETS.md;
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const pages: string[] = [];
  let currentParts: string[] = [];
  let currentLength = 0;

  const getMaxChars = () => (pages.length === 0 ? budget.first : budget.other);

  const flushPage = () => {
    if (currentParts.length > 0) {
      pages.push(currentParts.join("\n\n"));
      currentParts = [];
      currentLength = 0;
    }
  };

  for (const para of paragraphs) {
    const maxChars = getMaxChars();
    const joinCost = currentParts.length > 0 ? 2 : 0;

    if (currentLength + joinCost + para.length <= maxChars) {
      currentParts.push(para);
      currentLength += joinCost + para.length;
      continue;
    }

    if (para.length <= budget.other && currentParts.length > 0) {
      flushPage();
      currentParts.push(para);
      currentLength = para.length;
      continue;
    }

    const sentences = para
      .split(/(?<=[.!?…]["”’']?)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length <= 1) {
      if (currentParts.length > 0) flushPage();
      currentParts.push(para);
      currentLength = para.length;
      continue;
    }

    let sentenceBuffer = "";
    for (const sentence of sentences) {
      const activeBudget = getMaxChars();
      const bufferJoinCost = currentParts.length > 0 && !sentenceBuffer ? 2 : 0;
      const spaceCost = sentenceBuffer ? 1 : 0;
      const projected =
        currentLength + bufferJoinCost + sentenceBuffer.length + spaceCost + sentence.length;

      if (projected <= activeBudget) {
        sentenceBuffer = sentenceBuffer ? `${sentenceBuffer} ${sentence}` : sentence;
      } else {
        if (sentenceBuffer) {
          currentParts.push(sentenceBuffer);
          sentenceBuffer = "";
        }
        flushPage();
        sentenceBuffer = sentence;
      }
    }

    if (sentenceBuffer) {
      currentParts.push(sentenceBuffer);
      currentLength += (currentParts.length > 1 ? 2 : 0) + sentenceBuffer.length;
    }
  }

  flushPage();
  return pages.length > 0 ? pages : [normalized];
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

function splitByChapterHeader(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const headerRegex = /^###\s+Chương\s+(\d+):\s*(.+)$/gm;

  const matches: Array<{
    chapterNumber: number;
    title: string;
    start: number;
    bodyStart: number;
  }> = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(normalized)) !== null) {
    matches.push({
      chapterNumber: Number(m[1]),
      title: m[2].trim(),
      start: m.index,
      bodyStart: m.index + m[0].length,
    });
  }

  return matches.map((entry, idx) => {
    const nextStart = idx + 1 < matches.length ? matches[idx + 1].start : normalized.length;
    const rawBody = normalized.slice(entry.bodyStart, nextStart);
    // Loại bỏ tiêu đề Phần/Cụm (## ...) của cụm chương tiếp theo nếu nằm cuối block
    const withoutNextSectionHeader = rawBody.replace(/\n+##\s+[^\n]+[\s\S]*$/m, "");
    return {
      chapterNumber: entry.chapterNumber,
      title: entry.title,
      body: stripTrailingRule(withoutNextSectionHeader),
    };
  });
}

export function parseLevel0BookMarkdown(markdown: string): StorySoulContext {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const sections = normalized.split(/^##\s+/m);

  let culturalSpirit = "";
  let storytellingRhythm = "";
  let ageMetaphor = "";
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
      ageMetaphor = cleanInlineMarkdown(
        content
          .split("\n")
          .map((line) => line.replace(/^-\s+/, "• "))
          .join("\n")
      );
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
    storytellingRhythm: storytellingRhythm || "Nhịp kể khoan thai, lắng sâu theo từng chương.",
    ageMetaphor: ageMetaphor || "Thông điệp ẩn dụ nuôi dưỡng tâm hồn trẻ thơ.",
    pronunciations,
  };
}

export function parseLevel1Markdown(markdown: string): Record<number, ParsedLevel1Chapter> {
  const blocks = splitByChapterHeader(markdown);
  const result: Record<number, ParsedLevel1Chapter> = {};

  for (const block of blocks) {
    const voiceSplit = block.body.split(/^#{3,4}\s+Lưu ý giọng kể[^\n]*$/m);
    const rawPassage = stripTrailingRule(voiceSplit[0] || "");
    const rawVoiceNote = stripTrailingRule(voiceSplit[1] || "");

    const passage = cleanInlineMarkdown(rawPassage);

    const voiceNote = cleanInlineMarkdown(
      rawVoiceNote
        .split("\n")
        .map((line) => line.replace(/^-\s+/, "• "))
        .join("\n")
    );

    result[block.chapterNumber] = {
      chapterNumber: block.chapterNumber,
      title: block.title,
      passage: passage || block.title,
      voiceNote:
        voiceNote || "Giữ giọng kể tự nhiên, rõ ràng và ngắt nhịp nhẹ nhàng theo từng hình ảnh.",
    };
  }

  return result;
}

export function parseLevel2Markdown(markdown: string): Record<number, SceneDetailedOutline> {
  const blocks = splitByChapterHeader(markdown);
  const result: Record<number, SceneDetailedOutline> = {};

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
      const italicNames = Array.from(block.body.matchAll(/\*([A-ZÀ-Ỹ][^*]{1,28})\*/g)).map((m) =>
        m[1].trim()
      );
      characters = Array.from(new Set(italicNames)).slice(0, 8);
      if (characters.length === 0) {
        characters = [block.title];
      }
    }

    if (!emotionalRhythm) {
      emotionalRhythm =
        localizedDetails[0] || `Giữ nhịp kể ấm áp, lắng sâu cho "${block.title}".`;
    }

    if (beats.length === 0) {
      beats.push(cleanInlineMarkdown(block.body));
    }

    result[block.chapterNumber] = {
      characters,
      localizedDetails: localizedDetails.slice(0, 6),
      emotionalRhythm,
      beats,
    };
  }

  return result;
}

const ROMAN_BOOK_MAP: Record<string, string> = {
  I: "quyen-1",
  II: "quyen-2",
  III: "quyen-3",
  IV: "quyen-4",
  V: "quyen-5",
};

/**
 * Phân tích tệp Level 3 (`dan-y-tom-tat-cac-chuong.md`).
 * Trả về map theo `chapterId` dạng `quyen-1-chuong-01` để không bị trùng số chương giữa các Quyển.
 */
export function parseLevel3Markdown(markdown: string): Record<string, string[]> {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const result: Record<string, string[]> = {};

  let currentBookId = "quyen-1";
  let currentChapterKey = "";

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    const bookMatch = trimmed.match(/^##\s+Quyển\s+([IVX]+)\b/);
    if (bookMatch) {
      const mapped = ROMAN_BOOK_MAP[bookMatch[1]];
      if (mapped) {
        currentBookId = mapped;
        currentChapterKey = "";
      }
      continue;
    }

    const chMatch = trimmed.match(/^###\s+Chương\s+(\d+):\s*(.+)$/);
    if (chMatch) {
      const chNum = Number(chMatch[1]);
      currentChapterKey = `${currentBookId}-chuong-${String(chNum).padStart(2, "0")}`;
      result[currentChapterKey] = [];
      continue;
    }

    if (currentChapterKey && trimmed.startsWith("- ")) {
      const point = cleanInlineMarkdown(trimmed.slice(2));
      if (point) {
        result[currentChapterKey].push(point);
      }
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
        const candidateJson = (await indexRes.json()) as Partial<RepoStoryIndex>;
        if (
          Array.isArray(candidateJson.chapters) &&
          candidateJson.chapters.length > 0 &&
          Array.isArray(candidateJson.illustrations) &&
          candidateJson.illustrations.length > 0
        ) {
          indexData = candidateJson as RepoStoryIndex;
          activeBaseUrl = base;
          break;
        }
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

  const level3File =
    indexData.levels?.[3]?.file ||
    indexData.chapters?.[0]?.levels?.level_3 ||
    "level-3-dan-y-tom-tat/dan-y-tom-tat-cac-chuong.md";
  const level4Gallery =
    indexData.levels?.[4]?.gallery_file || "level-4-tranh-goi-nho/bo-tranh-goi-nho.md";
  const level4PromptSpec =
    indexData.levels?.[4]?.prompt_spec_file || "level-4-tranh-goi-nho/prompts-28-phan-canh.md";

  const level0BookFiles = new Set<string>();
  const level1Files = new Set<string>();
  const level2Files = new Set<string>();

  for (const bk of indexData.books || []) {
    if (bk.level_0_file) level0BookFiles.add(bk.level_0_file);
    if (bk.level_1_file) level1Files.add(bk.level_1_file);
    if (bk.level_2_file) level2Files.add(bk.level_2_file);
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
  const booksMeta: StoryBookMeta[] = (indexData.books || []).map((bk) => {
    const level0File = bk.level_0_file || `level-0-khong-gian-boi-canh/${bk.slug}.md`;
    const level1File = bk.level_1_file || `level-1-toan-van/${bk.slug}.md`;
    const level2File = bk.level_2_file || `level-2-dan-y-chi-tiet/${bk.slug}.md`;
    if (fileCache[level0File]) {
      bookSouls[bk.id] = parseLevel0BookMarkdown(fileCache[level0File]);
    }
    return {
      id: bk.id,
      number: bk.number,
      slug: bk.slug,
      title: bk.title,
      subtitle: cleanInlineMarkdown(bk.subtitle || ""),
      isEpilogue: Boolean(bk.is_epilogue),
      illustrationStyle: bk.illustration_style,
      totalChapters: bk.total_chapters,
      level0File,
      level1File,
      level2File,
    };
  });

  const bookMap = new Map(booksMeta.map((b) => [b.id, b]));

  const parsedL1ByFile: Record<string, Record<number, ParsedLevel1Chapter>> = {};
  for (const p of level1Files) {
    if (fileCache[p]) parsedL1ByFile[p] = parseLevel1Markdown(fileCache[p]);
  }

  const parsedL2ByFile: Record<string, Record<number, SceneDetailedOutline>> = {};
  for (const p of level2Files) {
    if (fileCache[p]) parsedL2ByFile[p] = parseLevel2Markdown(fileCache[p]);
  }

  const level3Map = fileCache[level3File] ? parseLevel3Markdown(fileCache[level3File]) : {};

  const illustrations: StoryIllustration[] = (indexData.illustrations || []).map((ill) => {
    const bk = bookMap.get(ill.book_id);
    return {
      id: ill.id,
      ord: ill.number,
      bookId: ill.book_id,
      chaptersRef: ill.chapters_ref,
      title: ill.title,
      artStyle: mapIllustrationStyle(bk?.illustrationStyle || "", bk?.number || 1),
      repoImage: ill.image,
      imageGenerated: Boolean(ill.image_generated),
    };
  });

  const illustrationMap = new Map(illustrations.map((il) => [il.id, il]));

  const scenes: StoryScene[] = (indexData.chapters || []).map((ch) => {
    const bookMeta = bookMap.get(ch.book_id);
    const illMeta = illustrationMap.get(ch.illustration_id);

    const l1Path = ch.levels?.level_1 || bookMeta?.level1File || "";
    const l2Path = ch.levels?.level_2 || bookMeta?.level2File || "";

    const l1Chapter = l1Path ? parsedL1ByFile[l1Path]?.[ch.chapter_number] : undefined;
    const l2Outline = l2Path ? parsedL2ByFile[l2Path]?.[ch.chapter_number] : undefined;
    const l3Points = level3Map[ch.id];

    const summaryPoints =
      l3Points && l3Points.length > 0
        ? l3Points
        : l2Outline?.beats.slice(0, 5) || [`Chương ${ch.chapter_number}: ${ch.title}.`];

    const levelPaths: SceneLevelPaths = {
      level0Overview: ch.levels?.level_0?.overview || overviewPath,
      level0Book: ch.levels?.level_0?.book || bookMeta?.level0File || "",
      level1: l1Path,
      level2: l2Path,
      level3: ch.levels?.level_3 || level3File,
      level4Gallery: ch.levels?.level_4?.gallery || level4Gallery,
      level4Image: ch.levels?.level_4?.image || ch.image || illMeta?.repoImage || "",
      level4PromptSpec: ch.levels?.level_4?.prompt_spec || level4PromptSpec,
    };

    return {
      id: ch.id,
      ord: ch.global_number,
      chapterNumber: ch.chapter_number,
      bookId: ch.book_id,
      section: ch.section,
      illustrationId: ch.illustration_id,
      slug: illMeta?.repoImage?.split("/").pop()?.replace(/\.png$/, "") || ch.id,
      isEpilogue: Boolean(ch.is_epilogue),
      title: `Chương ${ch.chapter_number}: ${ch.title}`,
      passage: l1Chapter?.passage || ch.title,
      voiceNote:
        l1Chapter?.voiceNote ||
        "Giữ giọng kể ấm áp, tự nhiên, ngắt nhịp vừa phải theo từng hình ảnh.",
      detailedOutline: l2Outline || {
        characters: [ch.title],
        localizedDetails: [],
        emotionalRhythm: "Khoan thai, trang trọng và giàu hình ảnh sống động.",
        beats: summaryPoints,
      },
      summaryPoints,
      artStyle: illMeta?.artStyle || mapIllustrationStyle(bookMeta?.illustrationStyle || "", bookMeta?.number || 1),
      repoImage: ch.image || illMeta?.repoImage,
      imageGenerated: illMeta ? illMeta.imageGenerated : false,
      levelPaths,
    };
  });

  const primarySoul = bookSouls["quyen-1"] || Object.values(bookSouls)[0] || {
    culturalSpirit:
      "Đại sử thi 5 Quyển (180 Chương · 28 Tranh minh họa) kết nối từ Khởi Nguyên Sáng Thế đến Đêm Giáng Sinh và Ngoại truyện Ông già Noel.",
    storytellingRhythm:
      "Giọng kể tự nhiên, ấm áp và giàu hình ảnh trực quan cho trẻ 9–10 tuổi theo tinh thần Jakob Streit.",
    ageMetaphor:
      "Hành trình tìm ánh sáng nội tâm, lòng kiên trung và tình thương trao đi không vụ lợi.",
    pronunciations: [
      { term: "Michael", pronunciation: "Mi-kha-en", meaning: "Tổng lãnh thiên thần cầm gươm ánh sáng" },
      { term: "Adam – Eve", pronunciation: "A-đam – Ê-va", meaning: "Hai con người đầu tiên trong Vườn Địa Đàng" },
      { term: "Noah", pronunciation: "Nô-a", meaning: "Người đóng Con Tàu gỗ tuyết tùng" },
    ],
  };

  return {
    id: GENESIS_STORY_ID,
    title: indexData.title || "Từ Sáng Thế Đến Giáng Sinh — Bộ Sử Thi Luyện Kể Chuyện",
    titleEn: "From Genesis to Nativity — Epic Storytelling Practice",
    sourceInfo: `Nguồn từ repo xuvivn/from-genesis-to-nativity · ${indexData.total_books} Quyển · ${indexData.total_chapters} Chương · ${indexData.total_illustrations} Tranh`,
    targetAge: indexData.target_age || "9–10 tuổi",
    styleReference: indexData.style_reference || "Jakob Streit",
    goal: "Đọc hiểu bối cảnh & luyện kể trọn vẹn 180 Chương theo 4 cấp độ từ toàn văn đến 28 tranh thuần hình ảnh.",
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
    illustrations,
    scenes,
  };
}
