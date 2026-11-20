import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorytellingPracticePage } from "@/app/page";
import {
  getChapterRoute,
  getChapterSlug,
  getSeedStories,
  getStorySlug,
  resolveChapterRoute,
  resolveStoryRoute,
} from "@/lib/seoRoutes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getSeedStories().flatMap((story) =>
    story.scenes.map((scene) => ({
      storySlug: getStorySlug(story),
      chapterKey: `${scene.ord}-${getChapterSlug(scene)}`,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storySlug: string; chapterKey: string }>;
}): Promise<Metadata> {
  const { storySlug, chapterKey } = await params;
  const story = resolveStoryRoute(storySlug);
  const scene = story && resolveChapterRoute(story, chapterKey);
  if (!story || !scene) return {};
  const url = `${SITE_URL}${getChapterRoute(story, scene)}`;
  return {
    title: `${scene.title} · Chương ${scene.ord} · ${story.title} | ${SITE_NAME}`,
    description: scene.passage.slice(0, 155),
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: scene.title, description: scene.passage.slice(0, 155) },
  };
}

export default async function ChapterRoute({
  params,
}: {
  params: Promise<{ storySlug: string; chapterKey: string }>;
}) {
  const { storySlug, chapterKey } = await params;
  const story = resolveStoryRoute(storySlug);
  const scene = story && resolveChapterRoute(story, chapterKey);
  if (!story || !scene) notFound();
  return (
    <StorytellingPracticePage
      initialRoute={{ storyId: story.id, bookId: scene.bookId, sceneId: scene.id }}
    />
  );
}
