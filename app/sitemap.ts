import type { MetadataRoute } from "next";
import { getBookRoute, getChapterRoute, getSeedStories, getStoryRoute } from "@/lib/seoRoutes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
  ];
  for (const story of getSeedStories()) {
    entries.push({ url: `${SITE_URL}${getStoryRoute(story)}`, changeFrequency: "weekly", priority: 0.9 });
    for (const book of story.books || []) {
      entries.push({ url: `${SITE_URL}${getBookRoute(story, book)}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const scene of story.scenes) {
      entries.push({ url: `${SITE_URL}${getChapterRoute(story, scene)}`, changeFrequency: "monthly", priority: 0.8 });
    }
  }
  return entries;
}
