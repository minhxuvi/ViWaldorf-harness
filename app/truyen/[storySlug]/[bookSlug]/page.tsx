import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorytellingPracticePage } from "@/app/page";
import {
  getBookRoute,
  getBookSlug,
  getSeedStories,
  getStorySlug,
  resolveBookRoute,
  resolveStoryRoute,
} from "@/lib/seoRoutes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getSeedStories().flatMap((story) =>
    (story.books || []).map((book) => ({
      storySlug: getStorySlug(story),
      bookSlug: getBookSlug(book),
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storySlug: string; bookSlug: string }>;
}): Promise<Metadata> {
  const { storySlug, bookSlug } = await params;
  const story = resolveStoryRoute(storySlug);
  const book = story && resolveBookRoute(story, bookSlug);
  if (!story || !book) return {};
  const url = `${SITE_URL}${getBookRoute(story, book)}`;
  return {
    title: `${book.title} · ${story.title} | ${SITE_NAME}`,
    description: book.subtitle,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: book.title, description: book.subtitle },
  };
}

export default async function BookRoute({
  params,
}: {
  params: Promise<{ storySlug: string; bookSlug: string }>;
}) {
  const { storySlug, bookSlug } = await params;
  const story = resolveStoryRoute(storySlug);
  const book = story && resolveBookRoute(story, bookSlug);
  if (!story || !book) notFound();
  return <StorytellingPracticePage initialRoute={{ storyId: story.id, bookId: book.id }} />;
}
