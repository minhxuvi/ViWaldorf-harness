import { EARTH_STORY_ID } from "./repoStoryLoader";
import { PracticeLevel, ReadingProgress, StoryIllustration, StoryScene } from "./types";

export const READING_PROGRESS_STORAGE_KEY = "viwaldorf_reading_progress_v1";

export function createDefaultReadingProgress(storyId = EARTH_STORY_ID): ReadingProgress {
  return {
    storyId,
    selectedBookId: "all",
    activeLevel: 1,
    sceneId: "",
    sceneIndex: 0,
    illustrationId: "",
    illustrationIndex: 0,
    level1FlowMode: "scene",
    level1TextSize: "md",
    level3Scope: "all",
    showContextSection: false,
    scrollY: 0,
    scrollRatio: 0,
    updatedAt: new Date(0).toISOString(),
  };
}

function isPracticeLevel(value: unknown): value is PracticeLevel {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

export function isValidReadingProgress(raw: unknown): raw is ReadingProgress {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Partial<ReadingProgress>;
  return (
    typeof p.storyId === "string" &&
    p.storyId.trim().length > 0 &&
    typeof p.selectedBookId === "string" &&
    isPracticeLevel(p.activeLevel) &&
    typeof p.sceneId === "string" &&
    typeof p.sceneIndex === "number" &&
    Number.isFinite(p.sceneIndex) &&
    p.sceneIndex >= 0 &&
    typeof p.illustrationId === "string" &&
    typeof p.illustrationIndex === "number" &&
    Number.isFinite(p.illustrationIndex) &&
    p.illustrationIndex >= 0 &&
    (p.level1FlowMode === "scene" || p.level1FlowMode === "full") &&
    (p.level1TextSize === "sm" || p.level1TextSize === "md" || p.level1TextSize === "lg") &&
    (p.level3Scope === "all" || p.level3Scope === "current") &&
    typeof p.showContextSection === "boolean" &&
    typeof p.scrollY === "number" &&
    Number.isFinite(p.scrollY) &&
    p.scrollY >= 0 &&
    typeof p.scrollRatio === "number" &&
    Number.isFinite(p.scrollRatio) &&
    p.scrollRatio >= 0 &&
    p.scrollRatio <= 1 &&
    typeof p.updatedAt === "string" &&
    !Number.isNaN(Date.parse(p.updatedAt))
  );
}

export function sanitizeReadingProgress(raw: unknown): ReadingProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<ReadingProgress>;
  if (typeof p.storyId !== "string" || !p.storyId.trim()) return null;

  const base = createDefaultReadingProgress(p.storyId.trim());
  const activeLevel = isPracticeLevel(p.activeLevel) ? p.activeLevel : base.activeLevel;
  const sceneIndex =
    typeof p.sceneIndex === "number" && Number.isFinite(p.sceneIndex)
      ? Math.max(0, Math.floor(p.sceneIndex))
      : 0;
  const illustrationIndex =
    typeof p.illustrationIndex === "number" && Number.isFinite(p.illustrationIndex)
      ? Math.max(0, Math.floor(p.illustrationIndex))
      : 0;
  const scrollY =
    typeof p.scrollY === "number" && Number.isFinite(p.scrollY)
      ? Math.max(0, Math.round(p.scrollY))
      : 0;
  const scrollRatio =
    typeof p.scrollRatio === "number" && Number.isFinite(p.scrollRatio)
      ? Math.min(1, Math.max(0, p.scrollRatio))
      : 0;
  const updatedAt =
    typeof p.updatedAt === "string" && !Number.isNaN(Date.parse(p.updatedAt))
      ? new Date(Date.parse(p.updatedAt)).toISOString()
      : new Date().toISOString();

  return {
    storyId: base.storyId,
    selectedBookId:
      typeof p.selectedBookId === "string" && p.selectedBookId.trim()
        ? p.selectedBookId.trim()
        : "all",
    activeLevel,
    sceneId: typeof p.sceneId === "string" ? p.sceneId : "",
    sceneIndex,
    illustrationId: typeof p.illustrationId === "string" ? p.illustrationId : "",
    illustrationIndex,
    level1FlowMode: p.level1FlowMode === "full" ? "full" : "scene",
    level1TextSize:
      p.level1TextSize === "sm" || p.level1TextSize === "lg" ? p.level1TextSize : "md",
    level3Scope: p.level3Scope === "current" ? "current" : "all",
    showContextSection: Boolean(p.showContextSection),
    scrollY,
    scrollRatio,
    updatedAt,
  };
}

export function loadLocalReadingProgress(): ReadingProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return sanitizeReadingProgress(parsed);
  } catch {
    return null;
  }
}

export function saveLocalReadingProgress(progress: ReadingProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function mergeReadingProgress(
  local: ReadingProgress | null,
  remote: ReadingProgress | null
): ReadingProgress | null {
  const validLocal = local && isValidReadingProgress(local) ? local : sanitizeReadingProgress(local);
  const validRemote =
    remote && isValidReadingProgress(remote) ? remote : sanitizeReadingProgress(remote);

  if (!validLocal) return validRemote;
  if (!validRemote) return validLocal;

  const localTs = Date.parse(validLocal.updatedAt);
  const remoteTs = Date.parse(validRemote.updatedAt);
  return remoteTs >= localTs ? validRemote : validLocal;
}

export function resolveSceneIndexFromProgress(
  visibleScenes: Pick<StoryScene, "id">[],
  progress: Pick<ReadingProgress, "sceneId" | "sceneIndex">
): number {
  if (visibleScenes.length === 0) return 0;
  if (progress.sceneId) {
    const idx = visibleScenes.findIndex((s) => s.id === progress.sceneId);
    if (idx >= 0) return idx;
  }
  return Math.max(0, Math.min(visibleScenes.length - 1, Math.floor(progress.sceneIndex || 0)));
}

export function resolveIllustrationIndexFromProgress(
  visibleIllustrations: Pick<StoryIllustration, "id">[],
  progress: Pick<ReadingProgress, "illustrationId" | "illustrationIndex">
): number {
  if (visibleIllustrations.length === 0) return 0;
  if (progress.illustrationId) {
    const idx = visibleIllustrations.findIndex((il) => il.id === progress.illustrationId);
    if (idx >= 0) return idx;
  }
  return Math.max(
    0,
    Math.min(visibleIllustrations.length - 1, Math.floor(progress.illustrationIndex || 0))
  );
}

export function computeScrollRatio(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number
): number {
  const maxScroll = Math.max(0, scrollHeight - innerHeight);
  if (maxScroll <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, scrollY / maxScroll));
  return Math.round(clamped * 10000) / 10000;
}

export function computeTargetScrollY(
  scrollRatio: number,
  fallbackScrollY: number,
  scrollHeight: number,
  innerHeight: number
): number {
  const maxScroll = Math.max(0, scrollHeight - innerHeight);
  if (scrollRatio > 0 && maxScroll > 0) {
    const ratio = Math.min(1, Math.max(0, scrollRatio));
    return Math.round(ratio * maxScroll);
  }
  if (maxScroll > 0) {
    return Math.min(maxScroll, Math.max(0, Math.round(fallbackScrollY)));
  }
  return Math.max(0, Math.round(fallbackScrollY));
}
