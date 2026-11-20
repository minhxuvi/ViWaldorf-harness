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
export const LOCAL_REPO_API_BASE_URL = "/api/local-repo";
export const GENESIS_STORY_ID = "story-from-genesis-to-nativity";

export const EARTH_REPO_OWNER = "xuvivn";
export const EARTH_REPO_NAME = "de-dat-de-nuoc";
export const EARTH_REPO_BRANCH = "main";
export const EARTH_REPO_URL = `https://github.com/${EARTH_REPO_OWNER}/${EARTH_REPO_NAME}`;
export const EARTH_RAW_BASE_URL = `https://raw.githubusercontent.com/${EARTH_REPO_OWNER}/${EARTH_REPO_NAME}/${EARTH_REPO_BRANCH}`;
export const EARTH_JSDELIVR_BASE_URL = `https://cdn.jsdelivr.net/gh/${EARTH_REPO_OWNER}/${EARTH_REPO_NAME}@${EARTH_REPO_BRANCH}`;
export const EARTH_LOCAL_REPO_API_BASE_URL = "/api/local-repo?repo=earth";
export const EARTH_STORY_ID = "story-de-dat-de-nuoc";

export type RepoLanguage = "vi" | "en" | "zh";

export const REPO_SYNC_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
export const REPO_MANUAL_COOLDOWN_MS = 15 * 1000; // 15 seconds
export const REPO_FETCH_CONCURRENCY = 6;

export function resolveLocaleRepoPath(
  relativePath: string,
  lang: RepoLanguage = "vi"
): string {
  const cleanPath = (relativePath || "").trim().replace(/^\/+/, "");
  if (!cleanPath) return "";
  if (
    cleanPath.startsWith("assets/") ||
    cleanPath.startsWith("locales/") ||
    cleanPath === "languages.json" ||
    cleanPath === "README.md"
  ) {
    return cleanPath;
  }
  return `locales/${lang}/${cleanPath}`;
}

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

export function getRepoKeyByStoryId(storyId?: string | null): "earth" | "genesis" {
  return storyId === EARTH_STORY_ID ? "earth" : "genesis";
}

export function getCandidateRepoBaseUrls(
  preferredBaseUrl?: string,
  options?: { includeLocalApi?: boolean; repo?: "genesis" | "earth" }
): string[] {
  const resolvedRepo: "genesis" | "earth" =
    options?.repo ||
    (preferredBaseUrl &&
    (preferredBaseUrl.includes("de-dat-de-nuoc") || preferredBaseUrl.includes("repo=earth"))
      ? "earth"
      : "genesis");
  const defaults =
    resolvedRepo === "earth"
      ? [EARTH_JSDELIVR_BASE_URL, EARTH_RAW_BASE_URL]
      : [GENESIS_JSDELIVR_BASE_URL, GENESIS_RAW_BASE_URL];
  const isBrowserLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const shouldUseLocalApi =
    options?.includeLocalApi === true ||
    preferredBaseUrl === LOCAL_REPO_API_BASE_URL ||
    preferredBaseUrl === EARTH_LOCAL_REPO_API_BASE_URL ||
    (options?.includeLocalApi !== false && isBrowserLocalhost);

  const candidates: string[] = [];
  if (shouldUseLocalApi) {
    candidates.push(
      resolvedRepo === "earth"
        ? EARTH_LOCAL_REPO_API_BASE_URL
        : LOCAL_REPO_API_BASE_URL
    );
  }
  if (
    preferredBaseUrl &&
    preferredBaseUrl !== GENESIS_RAW_BASE_URL &&
    preferredBaseUrl !== EARTH_RAW_BASE_URL &&
    preferredBaseUrl !== LOCAL_REPO_API_BASE_URL &&
    preferredBaseUrl !== EARTH_LOCAL_REPO_API_BASE_URL
  ) {
    candidates.push(preferredBaseUrl);
  }
  candidates.push(...defaults);
  return Array.from(new Set(candidates));
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

function isClusterIllustration(illustration: RepoIndexIllustration): boolean {
  return /(?:^|\/)canh-\d{2}-[^/]+\.png$/i.test(illustration.image);
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
    if (ch === "(" || ch === "（") depth++;
    else if ((ch === ")" || ch === "）") && depth > 0) depth--;

    if ((ch === "," || ch === ";" || ch === "、" || ch === "，" || ch === "；") && depth === 0) {
      const trimmed = current.trim().replace(/[.。]$/, "");
      if (trimmed) result.push(trimmed);
      current = "";
    } else {
      current += ch;
    }
  }

  const tail = current.trim().replace(/[.。]$/, "");
  if (tail) result.push(tail);
  return result;
}

function splitByChapterHeader(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const headerRegex = /^###\s+(?:Chương\s+|Chapter\s+|第)(\d+)(?:章)?\s*[:：]\s*(.+)$/gm;

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

export function parseLevel0BookMarkdown(
  markdown: string,
  lang: RepoLanguage = "vi"
): StorySoulContext {
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
      const hasSeparator = lines.some((l) => {
        const t = l.trim();
        return /^\|\s*:?---+/.test(t) || t.includes(":---");
      });
      let passedSeparator = !hasSeparator;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("|")) continue;
        if (/^\|\s*:?---+/.test(trimmed) || trimmed.includes(":---")) {
          passedSeparator = true;
          continue;
        }
        if (!passedSeparator) continue;
        const cells = trimmed
          .split("|")
          .slice(1, -1)
          .map((c) => cleanInlineMarkdown(c));
        const headerLower = (cells[0] || "").toLowerCase();
        if (
          cells.length >= 3 &&
          !headerLower.includes("tên trong văn bản") &&
          !headerLower.includes("name in text") &&
          !headerLower.includes("标准中文译名") &&
          !headerLower.includes("文本中的名称")
        ) {
          pronunciations.push({
            term: cells[0],
            pronunciation: cells[1],
            meaning: cells[2],
          });
        }
      }
    }
  }

  const fallbacks =
    lang === "en"
      ? {
          culturalSpirit: "Syncing cultural spirit and context from the story repository.",
          storytellingRhythm: "An unhurried, deeply resonant storytelling rhythm across each chapter.",
          ageMetaphor: "Imaginative metaphors nurturing the inner life of ages 9–10.",
        }
      : lang === "zh"
      ? {
          culturalSpirit: "正在从故事资料库同步文化背景与核心精神。",
          storytellingRhythm: "舒缓从容、沉静饱满的讲述节奏。",
          ageMetaphor: "滋养9–10岁儿童心灵与想象力的诗意隐喻。",
        }
      : {
          culturalSpirit: "Đang đồng bộ tinh thần văn hóa từ kho sử thi.",
          storytellingRhythm: "Nhịp kể khoan thai, lắng sâu theo từng chương.",
          ageMetaphor: "Thông điệp ẩn dụ nuôi dưỡng tâm hồn trẻ thơ.",
        };

  return {
    culturalSpirit: culturalSpirit || fallbacks.culturalSpirit,
    storytellingRhythm: storytellingRhythm || fallbacks.storytellingRhythm,
    ageMetaphor: ageMetaphor || fallbacks.ageMetaphor,
    pronunciations,
  };
}

export function parseLevel1Markdown(
  markdown: string,
  lang: RepoLanguage = "vi"
): Record<number, ParsedLevel1Chapter> {
  const blocks = splitByChapterHeader(markdown);
  const result: Record<number, ParsedLevel1Chapter> = {};
  const defaultVoiceNote =
    lang === "en"
      ? "Keep a natural, clear speaking voice with gentle pauses between living images."
      : lang === "zh"
      ? "保持自然清晰的语调，在每个生动的画面之间从容停顿换气。"
      : "Giữ giọng kể tự nhiên, rõ ràng và ngắt nhịp nhẹ nhàng theo từng hình ảnh.";

  for (const block of blocks) {
    const voiceSplit = block.body.split(
      /^#{3,4}\s+(?:Lưu ý giọng kể|Storytelling Notes|Note the narrator's voice|Narration note|讲演提示|讲述语气提示)[^\n]*$/m
    );
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
      voiceNote: voiceNote || defaultVoiceNote,
    };
  }

  return result;
}

export function parseLevel2Markdown(
  markdown: string,
  lang: RepoLanguage = "vi"
): Record<number, SceneDetailedOutline> {
  const blocks = splitByChapterHeader(markdown);
  const result: Record<number, SceneDetailedOutline> = {};

  for (const block of blocks) {
    const lines = block.body.split("\n");
    let currentKey = "";
    const topSections: Record<string, string[]> = {};

    for (const rawLine of lines) {
      const topMatch = rawLine.match(/^-\s+\*\*([^*]+)\*\*\s*(.*)$/);
      if (topMatch) {
        currentKey = topMatch[1].replace(/[:：]$/, "").trim().toLowerCase();
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

      if (
        key.includes("nhân vật") ||
        key.includes("character") ||
        key.includes("人物")
      ) {
        const items = splitTopLevelCommas(joinedClean);
        characters = items.slice(0, 14);
      } else if (key.includes("điệp khúc") || key.includes("refrain")) {
        localizedDetails.push(`Điệp khúc: ${joinedClean}`);
      } else if (key.includes("tương tác") || key.includes("cử chỉ")) {
        localizedDetails.push(`Cử chỉ minh họa: ${joinedClean}`);
      } else if (key.includes("bối cảnh")) {
        localizedDetails.push(`Bối cảnh & Tâm thức: ${joinedClean}`);
      } else if (
        key.includes("diễn biến") ||
        key.includes("mạch kể") ||
        key.includes("plot beat") ||
        key.includes("detailed plot") ||
        key.includes("detailed development") ||
        key.includes("详细发展") ||
        key.includes("情节")
      ) {
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
        key.includes("chiều sâu") ||
        key.includes("meaning") ||
        key.includes("storytelling focus") ||
        key.includes("storytelling highlight") ||
        key.includes("significance") ||
        key.includes("寓意") ||
        key.includes("重点") ||
        key.includes("意义") ||
        key.includes("叙事要点")
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
        localizedDetails[0] ||
        (lang === "en"
          ? `Keep a warm, unhurried storytelling cadence for "${block.title}".`
          : lang === "zh"
          ? `为《${block.title}》保持温暖从容、娓娓道来的讲述节奏。`
          : `Giữ nhịp kể ấm áp, lắng sâu cho "${block.title}".`);
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

const BOOK_NUMERAL_MAP: Record<string, string> = {
  I: "quyen-1",
  II: "quyen-2",
  III: "quyen-3",
  IV: "quyen-4",
  V: "quyen-5",
  VI: "quyen-6",
  一: "quyen-1",
  二: "quyen-2",
  三: "quyen-3",
  四: "quyen-4",
  五: "quyen-5",
  六: "quyen-6",
  "1": "quyen-1",
  "2": "quyen-2",
  "3": "quyen-3",
  "4": "quyen-4",
  "5": "quyen-5",
  "6": "quyen-6",
};

/**
 * Phân tích tệp Level 3 (`chapter-summaries.md` / `dan-y-tom-tat-cac-chuong.md`).
 * Trả về map theo `chapterId` dạng `quyen-1-chuong-01` để không bị trùng số chương giữa các Quyển/Hồi.
 */
export function parseLevel3Markdown(markdown: string): Record<string, string[]> {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const result: Record<string, string[]> = {};

  let currentBookId = "quyen-1";
  let currentChapterKey = "";

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    const bookMatch = trimmed.match(
      /^##\s+(?:(?:Quyển|Hồi|Book|Act|Chapter)\s+([IVX]+)|第\s*([IVX一二三四五六1-6]+)\s*[卷幕回])(?=[\s:：（(]|$)/
    );
    if (bookMatch) {
      const token = bookMatch[1] || bookMatch[2];
      const mapped = token ? BOOK_NUMERAL_MAP[token] : undefined;
      if (mapped) {
        currentBookId = mapped;
        currentChapterKey = "";
      }
      continue;
    }

    const chMatch = trimmed.match(/^###\s+(?:Chương\s+|Chapter\s+|第)(\d+)(?:章)?\s*[:：]\s*(.+)$/);
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
  if (rawBaseUrl.startsWith("/api/local-repo")) {
    const baseWithoutQuery = rawBaseUrl.split("?")[0];
    const query = rawBaseUrl.split("?")[1];
    return `${baseWithoutQuery}/${cleanPath}${query ? `?${query}` : ""}`;
  }
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
  options?: { preferFresh?: boolean; repo?: "genesis" | "earth" }
): Promise<string> {
  const cacheMode: RequestCache = options?.preferFresh ? "no-cache" : "default";
  const candidateBases = getCandidateRepoBaseUrls(rawBaseUrl, { repo: options?.repo });
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

function formatChapterTitle(
  chapterNumber: number,
  rawTitle: string,
  lang: RepoLanguage
): string {
  const trimmed = rawTitle.trim();
  if (/^(?:Chương|Chapter)\s+\d+\s*[:：]|^第\s*\d+\s*章\s*[:：]/.test(trimmed)) {
    return trimmed;
  }
  if (lang === "en") return `Chapter ${chapterNumber}: ${trimmed}`;
  if (lang === "zh") return `第${chapterNumber}章：${trimmed}`;
  return `Chương ${chapterNumber}: ${trimmed}`;
}

export async function fetchGenesisStoryFromRepo(
  rawBaseUrl = GENESIS_JSDELIVR_BASE_URL,
  options?: {
    preferFresh?: boolean;
    lang?: RepoLanguage;
    repo?: "genesis" | "earth";
  }
): Promise<WaldorfStory> {
  const lang: RepoLanguage = options?.lang || "vi";
  const repo = options?.repo || "genesis";
  const cacheMode: RequestCache = options?.preferFresh ? "no-cache" : "default";
  const candidateBases = getCandidateRepoBaseUrls(rawBaseUrl, { repo });
  let indexData: RepoStoryIndex | null = null;
  let activeBaseUrl = candidateBases[0];
  let loadedFromLegacyRoot = false;
  let lastStatus = 0;

  const indexCandidates =
    lang === "vi" ? [`locales/${lang}/story-index.json`, "story-index.json"] : [`locales/${lang}/story-index.json`];

  for (const base of candidateBases) {
    for (const indexRelPath of indexCandidates) {
      try {
        const indexRes = await fetch(buildRepoFileUrl(indexRelPath, base), {
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
            loadedFromLegacyRoot = indexRelPath === "story-index.json";
            break;
          }
        }
        lastStatus = indexRes.status;
      } catch {
        // Thử đường dẫn hoặc CDN dự phòng tiếp theo
      }
    }
    if (indexData) break;
  }

  if (!indexData) {
    throw new Error(
      `Không thể đọc locales/${lang}/story-index.json từ CDN/Repo${lastStatus ? ` (${lastStatus})` : ""}`
    );
  }

  const resolvePath = (p: string) =>
    loadedFromLegacyRoot ? (p || "").trim().replace(/^\/+/, "") : resolveLocaleRepoPath(p, lang);

  const level0Config = indexData.levels?.[0] || {};
  const overviewPath = resolvePath(
    level0Config.overview_file || "level-0-context/00-epic-soul-overview.md"
  );
  const ancientBooks: AncientBookItem[] = (level0Config.ancient_books || []).map((ab) => ({
    ...ab,
    file: resolvePath(ab.file),
  }));

  const level3File = resolvePath(
    indexData.levels?.[3]?.file ||
      indexData.chapters?.[0]?.levels?.level_3 ||
      "level-3-summary-outline/chapter-summaries.md"
  );
  const level4Gallery = resolvePath(
    indexData.levels?.[4]?.gallery_file || "level-4-visual-prompts/illustration-gallery.md"
  );
  const level4PromptSpec = resolvePath(
    indexData.levels?.[4]?.prompt_spec_file || "level-4-visual-prompts/prompts-28-scenes.md"
  );

  const level0BookFiles = new Set<string>();
  const level1Files = new Set<string>();
  const level2Files = new Set<string>();

  for (const bk of indexData.books || []) {
    if (bk.level_0_file) level0BookFiles.add(resolvePath(bk.level_0_file));
    if (bk.level_1_file) level1Files.add(resolvePath(bk.level_1_file));
    if (bk.level_2_file) level2Files.add(resolvePath(bk.level_2_file));
  }

  const allPaths = Array.from(
    new Set([overviewPath, ...level0BookFiles, ...level1Files, ...level2Files, level3File])
  ).filter(Boolean);
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
    const level0File = resolvePath(bk.level_0_file || `level-0-context/${bk.slug}.md`);
    const level1File = resolvePath(bk.level_1_file || `level-1-full-text/${bk.slug}.md`);
    const level2File = resolvePath(bk.level_2_file || `level-2-detailed-outline/${bk.slug}.md`);
    if (fileCache[level0File]) {
      bookSouls[bk.id] = parseLevel0BookMarkdown(fileCache[level0File], lang);
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
    if (fileCache[p]) parsedL1ByFile[p] = parseLevel1Markdown(fileCache[p], lang);
  }

  const parsedL2ByFile: Record<string, Record<number, SceneDetailedOutline>> = {};
  for (const p of level2Files) {
    if (fileCache[p]) parsedL2ByFile[p] = parseLevel2Markdown(fileCache[p], lang);
  }

  const level3Map = fileCache[level3File] ? parseLevel3Markdown(fileCache[level3File]) : {};

  const indexedIllustrations =
    indexData.total_illustrations > 28
      ? (indexData.illustrations || []).filter(isClusterIllustration)
      : indexData.illustrations || [];
  const illustrations: StoryIllustration[] = indexedIllustrations.map((ill) => {
    const bk = bookMap.get(ill.book_id);
    return {
      id: ill.id,
      ord: ill.number,
      bookId: ill.book_id,
      chaptersRef: ill.chapters_ref,
      title: ill.title,
      artStyle: mapIllustrationStyle(bk?.illustrationStyle || "", bk?.number || 1),
      repoImage: resolvePath(ill.image),
      imageGenerated: Boolean(ill.image_generated),
    };
  });

  const illustrationMap = new Map(illustrations.map((il) => [il.id, il]));

  const defaultVoiceNote =
    lang === "en"
      ? "Keep a warm, natural speaking voice and pause gently between living story images."
      : lang === "zh"
      ? "保持温暖自然的讲述语调，在每个生动的画面之间从容换气停顿。"
      : "Giữ giọng kể ấm áp, tự nhiên, ngắt nhịp vừa phải theo từng hình ảnh.";

  const defaultEmotionalRhythm =
    lang === "en"
      ? "Unhurried, dignified, and vivid with living imagery."
      : lang === "zh"
      ? "舒缓庄重，富有鲜活饱满的画面感。"
      : "Khoan thai, trang trọng và giàu hình ảnh sống động.";

  const scenes: StoryScene[] = (indexData.chapters || []).map((ch) => {
    const bookMeta = bookMap.get(ch.book_id);
    const illMeta = illustrationMap.get(ch.illustration_id);

    const l1Path = ch.levels?.level_1
      ? resolvePath(ch.levels.level_1)
      : bookMeta?.level1File || "";
    const l2Path = ch.levels?.level_2
      ? resolvePath(ch.levels.level_2)
      : bookMeta?.level2File || "";

    const l1Chapter = l1Path ? parsedL1ByFile[l1Path]?.[ch.chapter_number] : undefined;
    const l2Outline = l2Path ? parsedL2ByFile[l2Path]?.[ch.chapter_number] : undefined;
    const l3Points = level3Map[ch.id];

    const formattedTitle = formatChapterTitle(ch.chapter_number, ch.title, lang);
    const summaryPoints =
      l3Points && l3Points.length > 0
        ? l3Points
        : l2Outline?.beats.slice(0, 5) || [`${formattedTitle}.`];

    const level4ImagePath = ch.levels?.level_4?.image
      ? resolvePath(ch.levels.level_4.image)
      : ch.image
      ? resolvePath(ch.image)
      : illMeta?.repoImage || "";

    const levelPaths: SceneLevelPaths = {
      level0Overview: ch.levels?.level_0?.overview
        ? resolvePath(ch.levels.level_0.overview)
        : overviewPath,
      level0Book: ch.levels?.level_0?.book
        ? resolvePath(ch.levels.level_0.book)
        : bookMeta?.level0File || "",
      level1: l1Path,
      level2: l2Path,
      level3: ch.levels?.level_3 ? resolvePath(ch.levels.level_3) : level3File,
      level4Gallery: ch.levels?.level_4?.gallery
        ? resolvePath(ch.levels.level_4.gallery)
        : level4Gallery,
      level4Image: level4ImagePath,
      level4PromptSpec: ch.levels?.level_4?.prompt_spec
        ? resolvePath(ch.levels.level_4.prompt_spec)
        : level4PromptSpec,
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
      title: formattedTitle,
      passage: l1Chapter?.passage || ch.title,
      voiceNote: l1Chapter?.voiceNote || defaultVoiceNote,
      detailedOutline: l2Outline || {
        characters: [ch.title],
        localizedDetails: [],
        emotionalRhythm: defaultEmotionalRhythm,
        beats: summaryPoints,
      },
      summaryPoints,
      artStyle:
        illMeta?.artStyle ||
        mapIllustrationStyle(bookMeta?.illustrationStyle || "", bookMeta?.number || 1),
      repoImage: ch.image ? resolvePath(ch.image) : illMeta?.repoImage,
      imageGenerated: illMeta ? illMeta.imageGenerated : false,
      levelPaths,
    };
  });

  const primarySoul = bookSouls["quyen-1"] || Object.values(bookSouls)[0] || {
    culturalSpirit:
      repo === "earth"
        ? "Sử thi Mường Đẻ đất đẻ nước bám theo lời mo, tiếng Mường, nhịp điệu lễ tang và đời sống cộng đồng."
        : "Đại sử thi 5 Quyển (180 Chương · 28 Tranh minh họa) kết nối từ Khởi Nguyên Sáng Thế đến Đêm Giáng Sinh.",
    storytellingRhythm:
      repo === "earth"
        ? "Giọng kể trang trọng, khoan thai và giàu hình ảnh cho trẻ 9–10 tuổi."
        : "Giọng kể tự nhiên, ấm áp và giàu hình ảnh trực quan cho trẻ 9–10 tuổi theo tinh thần Jakob Streit.",
    ageMetaphor:
      repo === "earth"
        ? "Hành trình về nguồn cội đất, nước, nòi giống, mùa vụ và nếp sống cộng đồng Mường."
        : "Hành trình tìm ánh sáng nội tâm, lòng kiên trung và tình thương trao đi không vụ lợi.",
    pronunciations: [],
  };

  const localizedSourceInfo =
    repo === "earth"
      ? lang === "en"
        ? `Source: xuvivn/de-dat-de-nuoc · ${indexData.total_books} Acts · ${indexData.total_chapters} Chapters · ${illustrations.length} Illustrations`
        : lang === "zh"
        ? `语料来源：xuvivn/de-dat-de-nuoc · ${indexData.total_books}幕 · ${indexData.total_chapters}章 · ${illustrations.length}幅画作`
        : `Nguồn từ repo xuvivn/de-dat-de-nuoc · ${indexData.total_books} Hồi · ${indexData.total_chapters} Chương · ${illustrations.length} Tranh`
      : lang === "en"
      ? `Source: xuvivn/from-genesis-to-nativity · ${indexData.total_books} Books · ${indexData.total_chapters} Chapters · ${illustrations.length} Illustrations`
      : lang === "zh"
      ? `语料来源：xuvivn/from-genesis-to-nativity · ${indexData.total_books}卷 · ${indexData.total_chapters}章 · ${illustrations.length}幅插画`
      : `Nguồn từ repo xuvivn/from-genesis-to-nativity · ${indexData.total_books} Quyển · ${indexData.total_chapters} Chương · ${illustrations.length} Tranh`;

  const localizedGoal =
    repo === "earth"
      ? lang === "en"
        ? "Explore the Mường epic background and practice all 28 chapters across 4 levels—from full text to wordless visual recall."
        : lang === "zh"
        ? "理解芒族史诗背景与精神，并循序练习讲述全28章。"
        : "Đọc hiểu bối cảnh sử thi Mường & luyện kể trọn vẹn 28 Chương theo 4 cấp độ từ toàn văn đến tranh gợi nhớ."
      : lang === "en"
      ? "Explore background context and practice telling all 180 chapters across 4 levels—from full text to 28 wordless illustrations."
      : lang === "zh"
      ? "理解故事背景与精神，并循序练习讲述全180章——从完整全文到28幅纯视觉记忆插画。"
      : "Đọc hiểu bối cảnh & luyện kể trọn vẹn 180 Chương theo 4 cấp độ từ toàn văn đến 28 tranh thuần hình ảnh.";

  return {
    id: repo === "earth" ? EARTH_STORY_ID : GENESIS_STORY_ID,
    language: lang,
    title:
      indexData.title ||
      (repo === "earth"
        ? "Đẻ Đất Đẻ Nước — Bộ Sử Thi Luyện Kể Chuyện"
        : "Từ Sáng Thế Đến Giáng Sinh — Bộ Sử Thi Luyện Kể Chuyện"),
    titleEn:
      lang === "en"
        ? indexData.title
        : repo === "earth"
        ? "The Birth of Earth and Water — Epic Storytelling Practice"
        : "From Genesis to Nativity — Epic Storytelling Practice",
    sourceInfo: localizedSourceInfo,
    targetAge: indexData.target_age || (lang === "en" ? "9–10 years" : lang === "zh" ? "9–10岁" : "9–10 tuổi"),
    styleReference: indexData.style_reference || (repo === "earth" ? "Sử thi Mường — lời mo" : "Jakob Streit"),
    goal: localizedGoal,
    defaultArtStyle: "chalkboard",
    repoUrl: repo === "earth" ? EARTH_REPO_URL : GENESIS_REPO_URL,
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

export async function fetchEarthStoryFromRepo(
  rawBaseUrl = EARTH_JSDELIVR_BASE_URL,
  options?: { preferFresh?: boolean; lang?: RepoLanguage }
): Promise<WaldorfStory> {
  return fetchGenesisStoryFromRepo(rawBaseUrl, {
    preferFresh: options?.preferFresh,
    lang: options?.lang,
    repo: "earth",
  });
}
