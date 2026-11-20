import { getSeedData } from "./seedData";
import { StoryBookMeta, StoryScene, WaldorfStory } from "./types";

export interface StoryRouteTarget {
  storyId: string;
  bookId?: string;
  sceneId?: string;
}

const STORY_SLUGS: Record<string, string> = {
  "story-de-dat-de-nuoc": "de-dat-de-nuoc",
  "story-from-genesis-to-nativity": "tu-sang-the-den-giang-sinh",
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStorySlug(story: WaldorfStory): string {
  return STORY_SLUGS[story.id] || slugify(story.title);
}

export function getBookSlug(book: StoryBookMeta): string {
  return book.slug || `${book.id}-${slugify(book.title)}`;
}

export function getChapterSlug(scene: StoryScene): string {
  return slugify(scene.title) || scene.slug || scene.id;
}

export function getStoryRoute(story: WaldorfStory): string {
  return `/truyen/${getStorySlug(story)}`;
}

export function getBookRoute(story: WaldorfStory, book: StoryBookMeta): string {
  return `${getStoryRoute(story)}/${getBookSlug(book)}`;
}

export function getChapterRoute(story: WaldorfStory, scene: StoryScene): string {
  return `${getStoryRoute(story)}/chuong-${scene.ord}-${getChapterSlug(scene)}`;
}

export function getSeedStories(): WaldorfStory[] {
  return getSeedData("vi").stories;
}

export function resolveStoryRoute(storySlug: string): WaldorfStory | undefined {
  return getSeedStories().find((story) => getStorySlug(story) === storySlug);
}

export function resolveBookRoute(
  story: WaldorfStory,
  bookSlug: string
): StoryBookMeta | undefined {
  return (story.books || []).find((book) => getBookSlug(book) === bookSlug);
}

export function resolveChapterRoute(
  story: WaldorfStory,
  chapterKey?: string
): StoryScene | undefined {
  if (!chapterKey) return undefined;
  const separator = chapterKey.indexOf("-");
  if (separator <= 0) return undefined;
  const ord = Number(chapterKey.slice(0, separator));
  const chapterSlug = chapterKey.slice(separator + 1);
  return story.scenes.find(
    (scene) => scene.ord === ord && getChapterSlug(scene) === chapterSlug
  );
}
