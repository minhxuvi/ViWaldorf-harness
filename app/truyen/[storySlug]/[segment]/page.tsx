import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorytellingPracticePage } from "@/app/page";
import {
  getBookRoute,
  getBookSlug,
  getChapterRoute,
  getChapterSegment,
  getSeedStories,
  getStorySlug,
  resolveBookRoute,
  resolveChapterRoute,
  resolveStoryRoute,
} from "@/lib/seoRoutes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getSeedStories().flatMap((story) => {
    const storySlug = getStorySlug(story);
    return [
      ...(story.books || []).map((book) => ({
        storySlug,
        segment: getBookSlug(book),
      })),
      ...story.scenes.map((scene) => ({
        storySlug,
        segment: getChapterSegment(scene),
      })),
    ];
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storySlug: string; segment: string }>;
}): Promise<Metadata> {
  const { storySlug, segment } = await params;
  const story = resolveStoryRoute(storySlug);
  if (!story) return {};

  if (segment.startsWith("chuong-")) {
    const scene = resolveChapterRoute(story, segment);
    if (!scene) return {};
    const url = `${SITE_URL}${getChapterRoute(story, scene)}`;
    const title = `${scene.title} · ${story.title} | ${SITE_NAME}`;
    const description = scene.passage.slice(0, 155);
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title: scene.title,
        description,
      },
    };
  }

  const book = resolveBookRoute(story, segment);
  if (!book) return {};
  const url = `${SITE_URL}${getBookRoute(story, book)}`;
  return {
    title: `${book.title} · ${story.title} | ${SITE_NAME}`,
    description: book.subtitle,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: book.title,
      description: book.subtitle,
    },
  };
}

export default async function StorySegmentRoute({
  params,
}: {
  params: Promise<{ storySlug: string; segment: string }>;
}) {
  const { storySlug, segment } = await params;
  const story = resolveStoryRoute(storySlug);
  if (!story) notFound();

  if (segment.startsWith("chuong-")) {
    const scene = resolveChapterRoute(story, segment);
    if (!scene) notFound();
    return (
      <StorytellingPracticePage
        initialRoute={{ storyId: story.id, bookId: scene.bookId, sceneId: scene.id }}
      />
    );
  }

  const book = resolveBookRoute(story, segment);
  if (!book) notFound();
  return (
    <StorytellingPracticePage
      initialRoute={{ storyId: story.id, bookId: book.id }}
    />
  );
}
