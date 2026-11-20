import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorytellingPracticePage } from "@/app/page";
import {
  getSeedStories,
  getStoryRoute,
  getStorySlug,
  resolveStoryRoute,
} from "@/lib/seoRoutes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getSeedStories().map((story) => ({ storySlug: getStorySlug(story) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storySlug: string }>;
}): Promise<Metadata> {
  const story = resolveStoryRoute((await params).storySlug);
  if (!story) return {};
  return {
    title: `${story.title} | ${SITE_NAME}`,
    description: story.goal,
    alternates: { canonical: `${SITE_URL}${getStoryRoute(story)}` },
    openGraph: { type: "article", url: `${SITE_URL}${getStoryRoute(story)}`, title: story.title, description: story.goal },
  };
}

export default async function StoryRoute({
  params,
}: {
  params: Promise<{ storySlug: string }>;
}) {
  const story = resolveStoryRoute((await params).storySlug);
  if (!story) notFound();
  return <StorytellingPracticePage initialRoute={{ storyId: story.id }} />;
}
