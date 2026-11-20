import { getSeedData } from "./seedData";
import { SITE_NAME } from "./site";
import { StoryBookMeta, StoryScene, WaldorfStory } from "./types";

export type StoryRouteGranularity = "story" | "book" | "chapter";

export interface StoryRouteTarget {
  storyId: string;
  bookId?: string;
  sceneId?: string;
}

const STORY_SLUGS: Record<string, string> = {
  "story-de-dat-de-nuoc": "de-dat-de-nuoc",
  "story-from-genesis-to-nativity": "tu-sang-the-den-giang-sinh",
};

let cachedSeedStories: WaldorfStory[] | null = null;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripLeadingChapterPrefix(title: string): string {
  return title
    .replace(/^(?:chương|chuong|chapter)\s+\d+\s*[:.\-–—]\s*/i, "")
    .replace(/^第\d+章\s*[:：\-–—]\s*/, "")
    .trim();
}

export function getSeedStories(): WaldorfStory[] {
  if (!cachedSeedStories) {
    cachedSeedStories = getSeedData("vi").stories;
  }
  return cachedSeedStories;
}

function getCanonicalStory(storyId: string): WaldorfStory | undefined {
  return getSeedStories().find((story) => story.id === storyId);
}

export function getStorySlug(story: WaldorfStory): string {
  return STORY_SLUGS[story.id] || slugify(story.title);
}

export function getBookSlug(book: StoryBookMeta): string {
  return book.slug || `${book.id}-${slugify(book.title)}`;
}

export function getChapterSlug(scene: StoryScene): string {
  const cleanedTitle = stripLeadingChapterPrefix(scene.title);
  return slugify(cleanedTitle) || slugify(scene.title) || scene.slug || scene.id;
}

export function getChapterSegment(scene: StoryScene): string {
  return `chuong-${scene.ord}-${getChapterSlug(scene)}`;
}

export function getStoryRoute(story: WaldorfStory): string {
  const canonicalStory = getCanonicalStory(story.id) || story;
  return `/truyen/${getStorySlug(canonicalStory)}`;
}

export function getBookRoute(story: WaldorfStory, book: StoryBookMeta): string {
  const canonicalStory = getCanonicalStory(story.id) || story;
  const canonicalBook =
    (canonicalStory.books || []).find((candidate) => candidate.id === book.id) || book;
  return `${getStoryRoute(canonicalStory)}/${getBookSlug(canonicalBook)}`;
}

export function getChapterRoute(story: WaldorfStory, scene: StoryScene): string {
  const canonicalStory = getCanonicalStory(story.id) || story;
  const canonicalScene =
    canonicalStory.scenes.find((candidate) => candidate.id === scene.id) ||
    canonicalStory.scenes.find((candidate) => candidate.ord === scene.ord) ||
    scene;
  return `${getStoryRoute(canonicalStory)}/${getChapterSegment(canonicalScene)}`;
}

export function resolveStoryRoute(storySlug: string): WaldorfStory | undefined {
  return getSeedStories().find((story) => getStorySlug(story) === storySlug);
}

export function resolveBookRoute(
  story: WaldorfStory,
  bookSlug: string
): StoryBookMeta | undefined {
  const canonicalStory = getCanonicalStory(story.id) || story;
  const canonicalBook = (canonicalStory.books || []).find(
    (book) => getBookSlug(book) === bookSlug
  );
  if (!canonicalBook) return undefined;
  return (story.books || []).find((book) => book.id === canonicalBook.id) || canonicalBook;
}

export function resolveChapterRoute(
  story: WaldorfStory,
  chapterKey?: string
): StoryScene | undefined {
  if (!chapterKey) return undefined;
  const normalizedKey = chapterKey.startsWith("chuong-")
    ? chapterKey.slice("chuong-".length)
    : chapterKey;
  const separator = normalizedKey.indexOf("-");
  if (separator <= 0) return undefined;
  const ord = Number(normalizedKey.slice(0, separator));
  const chapterSlug = normalizedKey.slice(separator + 1);
  if (!Number.isInteger(ord) || ord <= 0 || !chapterSlug) return undefined;

  const canonicalStory = getCanonicalStory(story.id) || story;
  const canonicalScene = canonicalStory.scenes.find(
    (scene) => scene.ord === ord && getChapterSlug(scene) === chapterSlug
  );
  if (!canonicalScene) return undefined;
  return story.scenes.find((scene) => scene.id === canonicalScene.id) || canonicalScene;
}

export function resolveStoryPath(pathname: string): StoryRouteTarget | undefined {
  const cleanPath = pathname.split(/[?#]/)[0] || "";
  const rawSegments = cleanPath.split("/").filter(Boolean);
  if (rawSegments.length < 2 || rawSegments.length > 3) return undefined;

  let segments: string[];
  try {
    segments = rawSegments.map((segment) => decodeURIComponent(segment));
  } catch {
    return undefined;
  }

  if (segments[0] !== "truyen") return undefined;
  const story = resolveStoryRoute(segments[1]);
  if (!story) return undefined;
  if (segments.length === 2) {
    return { storyId: story.id };
  }

  const segment = segments[2];
  if (segment.startsWith("chuong-")) {
    const scene = resolveChapterRoute(story, segment);
    if (!scene) return undefined;
    return {
      storyId: story.id,
      bookId: scene.bookId,
      sceneId: scene.id,
    };
  }

  const book = resolveBookRoute(story, segment);
  if (!book) return undefined;
  return {
    storyId: story.id,
    bookId: book.id,
  };
}

export function buildCanonicalRouteUrl(params: {
  storyId: string;
  bookId?: string;
  sceneId?: string;
  granularity: StoryRouteGranularity;
}): string | null {
  const story = getCanonicalStory(params.storyId);
  if (!story) return null;

  if (params.granularity === "chapter" && params.sceneId) {
    const scene = story.scenes.find((candidate) => candidate.id === params.sceneId);
    if (scene) return getChapterRoute(story, scene);
  }

  if (params.granularity === "book" && params.bookId && params.bookId !== "all") {
    const book = (story.books || []).find((candidate) => candidate.id === params.bookId);
    if (book) return getBookRoute(story, book);
  }

  return getStoryRoute(story);
}

export function buildRouteDocumentTitle(params: {
  story: WaldorfStory;
  bookId?: string;
  scene?: StoryScene;
  granularity: StoryRouteGranularity;
  lang?: string;
  siteName?: string;
}): string {
  const siteName = params.siteName || SITE_NAME;
  const storyTitle =
    params.lang === "en" && params.story.titleEn
      ? params.story.titleEn
      : params.story.title;

  if (params.granularity === "chapter" && params.scene) {
    return `${params.scene.title} · ${storyTitle} | ${siteName}`;
  }

  if (params.granularity === "book" && params.bookId && params.bookId !== "all") {
    const book = (params.story.books || []).find(
      (candidate) => candidate.id === params.bookId
    );
    if (book) {
      return `${book.title} · ${storyTitle} | ${siteName}`;
    }
  }

  return `${storyTitle} | ${siteName}`;
}
