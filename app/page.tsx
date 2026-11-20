"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useApp } from "@/lib/store";
import { FeedbackSection } from "@/components/FeedbackSection";
import {
  computePageScrollStep,
  computeScrollRatio,
  computeTargetScrollY,
  PAGE_SCROLL_OVERLAP_RATIO,
  resolveIllustrationIndexFromProgress,
  resolveSceneIndexFromProgress,
} from "@/lib/readingProgress";
import {
  AncientBookItem,
  PracticeLevel,
  ReadingProgress,
  StoryBookMeta,
  StoryIllustration,
  StoryScene,
  WaldorfArtStyle,
  VoiceRecording,
} from "@/lib/types";
import { ProceduralIllustrator } from "@/lib/art/proceduralIllustrator";
import { exportStoryToPdf, hasFullStoryPassages } from "@/lib/pdfExporter";
import {
  createIdleTimerState,
  getAudioFileExtension,
  getFinalRecordedDurationSeconds,
  getRecordedDisplaySeconds,
  pauseRecordingTimer,
  pickSupportedAudioMimeType,
  RecordingStatus,
  RecordingTimerState,
  resumeRecordingTimer,
  startRecordingTimer,
  supportsMediaRecorderPause,
} from "@/lib/voiceRecorder";
import {
  buildGitHubBlobUrl,
  buildRepoFileUrl,
  cleanInlineMarkdown,
  fetchAncientBookMarkdown,
  EARTH_STORY_ID,
  EARTH_JSDELIVR_BASE_URL,
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_REPO_URL,
  getCandidateRepoBaseUrls,
} from "@/lib/repoStoryLoader";
import {
  Mic,
  Pause,
  Play,
  Square,
  Upload,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Compass,
  Wind,
  Heart,
  Users,
  MapPin,
  ListChecks,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Download,
  Trash2,
  ListMusic,
  RotateCcw,
  RefreshCw,
  FolderGit2,
  ExternalLink,
  ScrollText,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Type,
  X,
  FileDown,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import {
  buildCanonicalRouteUrl,
  buildRouteDocumentTitle,
  resolveStoryPath,
  type StoryRouteGranularity,
  type StoryRouteTarget,
} from "@/lib/seoRoutes";

const PRACTICE_LEVELS: PracticeLevel[] = [1, 2, 3, 4];
const ANCIENT_CATEGORIES = [
  "all",
  "van-ban-co",
  "tu-lieu",
  "cuu-uoc",
  "tan-uoc",
  "co-thu",
] as const;
type AncientCategoryFilter = (typeof ANCIENT_CATEGORIES)[number];
type Level1TextSize = "sm" | "md" | "lg";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatLastSynced(iso?: string, lang?: string): string {
  if (!iso) return "";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "";
  try {
    const localeTag = lang === "en" ? "en-US" : lang === "zh" ? "zh-CN" : "vi-VN";
    return new Date(ts).toLocaleString(localeTag, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatMarkdownForReading(markdown: string): string {
  return cleanInlineMarkdown(
    markdown
      .replace(/\r\n/g, "\n")
      .replace(/^#{1,6}\s+(.+)$/gm, "$1")
      .replace(/^---+\s*$/gm, "")
      .replace(/^\s*[-*]\s+/gm, "• ")
  );
}

function formatSceneSection(
  bookTitle: string | undefined,
  section: string | undefined
): string {
  if (!section) return bookTitle || "";
  if (!bookTitle || bookTitle === section) return section;
  return `${bookTitle} · ${section}`;
}

function getActiveRepoPath(params: {
  level: PracticeLevel;
  showContextSection: boolean;
  scene?: StoryScene;
  illustration?: StoryIllustration;
  overviewPath?: string;
}): string {
  const { level, showContextSection, scene, illustration, overviewPath } = params;
  const lp = scene?.levelPaths;

  if (showContextSection) {
    return lp?.level0Book || lp?.level0Overview || overviewPath || "";
  }

  switch (level) {
    case 1:
      return lp?.level1 || "";
    case 2:
      return lp?.level2 || "";
    case 3:
      return lp?.level3 || "";
    case 4:
      return illustration?.repoImage || lp?.level4Image || "";
  }
}

export function StorytellingPracticePage({
  initialRoute,
}: {
  initialRoute?: StoryRouteTarget;
}) {
  const {
    updateData,
    data,
    selectedStory,
    activeStoryId,
    setActiveStoryId,
    t,
    lang,
    isSyncingRepo,
    syncError,
    syncNotice,
    syncFromRepo,
    activeView,
    setActiveView,
    readingProgress,
    isProgressLoaded,
    progressVersion,
    updateReadingProgress,
  } = useApp();

  // Trạng thái luyện tập 4 cấp độ (Level 1 -> Level 4)
  const [activeLevel, setActiveLevel] = useState<PracticeLevel>(1);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [activeIllustrationIndex, setActiveIllustrationIndex] = useState<number>(0);
  const [level1FlowMode, setLevel1FlowMode] = useState<"scene" | "full">("scene");
  const [level1TextSize, setLevel1TextSize] = useState<Level1TextSize>("md");
  const [level3Scope, setLevel3Scope] = useState<"all" | "current">("all");
  const [isLevel4StageMode, setIsLevel4StageMode] = useState<boolean>(false);
  const [selectedBookId, setSelectedBookId] = useState<string>("all");

  // Mục đọc thêm: Bối cảnh & Linh hồn câu chuyện (thay cho Level 0 trước đây)
  const [showContextSection, setShowContextSection] = useState<boolean>(false);
  const [showUtilitiesSection, setShowUtilitiesSection] = useState<boolean>(false);
  const [showEpicOverview, setShowEpicOverview] = useState<boolean>(false);
  const [ancientCategory, setAncientCategory] = useState<AncientCategoryFilter>("all");
  const [activeAncientBook, setActiveAncientBook] = useState<AncientBookItem | null>(null);
  const [ancientBookContent, setAncientBookContent] = useState<string>("");
  const [ancientBookLoading, setAncientBookLoading] = useState<boolean>(false);
  const [ancientBookError, setAncientBookError] = useState<string>("");
  const ancientCacheRef = useRef<Record<string, string>>({});

  // Xuất PDF toàn văn (2 lựa chọn: kèm ảnh hoặc không kèm ảnh)
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string>("");
  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState<boolean>(false);
  const pdfMenuRef = useRef<HTMLDivElement | null>(null);
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState<boolean>(false);
  const levelMenuRef = useRef<HTMLDivElement | null>(null);

  // Level 4: theo dõi URL ảnh từ repo bị lỗi & chế độ SVG dự phòng
  const [failedRepoImages, setFailedRepoImages] = useState<Record<string, boolean>>({});
  const [preferProceduralArt, setPreferProceduralArt] = useState<boolean>(false);

  // Điều hướng chạm / vuốt ngang trên thiết bị cảm ứng
  const readingSurfaceRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchLastRef = useRef<{ x: number; y: number } | null>(null);
  const lastSwipeAtRef = useRef<number>(0);

  // Thu âm & Nghe lại thuần túy (MediaRecorder) - thu gọn ở góc phải dưới
  const [isRecorderExpanded, setIsRecorderExpanded] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const isRecording = recordingStatus === "recording";
  const isPaused = recordingStatus === "paused";
  const isRecorderActive = recordingStatus !== "idle";
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [showTakesPanel, setShowTakesPanel] = useState(false);
  const [micError, setMicError] = useState<string>("");

  const customImageInputRef = useRef<HTMLInputElement | null>(null);
  const recorderDockRef = useRef<HTMLElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStateRef = useRef<RecordingTimerState>(createIdleTimerState());
  const isStartingRecordingRef = useRef<boolean>(false);
  const isUnmountedRef = useRef<boolean>(false);
  const recordingsRef = useRef<VoiceRecording[]>([]);
  const initialRouteKey = initialRoute
    ? `${initialRoute.storyId}|${initialRoute.bookId || ""}|${initialRoute.sceneId || ""}`
    : "";
  const [urlGranularity, setUrlGranularity] = useState<StoryRouteGranularity>(() =>
    initialRoute?.sceneId ? "chapter" : initialRoute?.bookId ? "book" : "story"
  );
  const appliedInitialRouteStoryKeyRef = useRef<string>("");
  const appliedInitialRouteKeyRef = useRef<string>("");
  const pendingHistoryModeRef = useRef<"replace" | "push" | "skip">("replace");
  const isUrlSyncReadyRef = useRef<boolean>(false);
  const storiesRef = useRef(data.stories);
  storiesRef.current = data.stories;

  useEffect(() => {
    if (!initialRoute?.storyId) return;
    if (appliedInitialRouteStoryKeyRef.current === initialRouteKey) return;
    appliedInitialRouteStoryKeyRef.current = initialRouteKey;
    setActiveStoryId(initialRoute.storyId);
  }, [initialRoute?.storyId, initialRouteKey, setActiveStoryId]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  const stopTickInterval = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTickInterval = useCallback(() => {
    stopTickInterval();
    timerRef.current = setInterval(() => {
      setRecordingSeconds(getRecordedDisplaySeconds(timerStateRef.current, Date.now()));
    }, 250);
  }, [stopTickInterval]);

  const releaseRecorderHandles = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  const resetActiveRecorderState = useCallback(() => {
    stopTickInterval();
    timerStateRef.current = createIdleTimerState();
    setRecordingStatus("idle");
    setRecordingSeconds(0);
  }, [stopTickInterval]);

  // Dọn dẹp timer, stream micro và Blob URL khi thoát trang
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      stopTickInterval();
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {}
      }
      releaseRecorderHandles();
      recordingsRef.current.forEach((rec) => {
        try {
          URL.revokeObjectURL(rec.audioUrl);
        } catch {}
      });
    };
  }, [stopTickInterval, releaseRecorderHandles]);

  // Đóng menu dropdown (chọn mức luyện tập / tùy chọn PDF) khi bấm ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!isPdfMenuOpen && !isLevelMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (isPdfMenuOpen && !pdfMenuRef.current?.contains(target)) {
        setIsPdfMenuOpen(false);
      }
      if (isLevelMenuOpen && !levelMenuRef.current?.contains(target)) {
        setIsLevelMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPdfMenuOpen(false);
        setIsLevelMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPdfMenuOpen, isLevelMenuOpen]);

  // Làm mới bộ nhớ đệm ảnh lỗi & văn bản cổ khi vừa đồng bộ xong hoặc đổi ngôn ngữ
  useEffect(() => {
    setFailedRepoImages({});
    ancientCacheRef.current = {};
    setActiveAncientBook(null);
    setAncientBookContent("");
    setAncientBookError("");
  }, [selectedStory?.lastSyncedAt, selectedStory?.language]);

  const allScenes: StoryScene[] = useMemo(() => selectedStory?.scenes || [], [selectedStory]);
  const allIllustrations: StoryIllustration[] = useMemo(
    () => selectedStory?.illustrations || [],
    [selectedStory]
  );
  const books = selectedStory?.books || [];

  const visibleScenes: StoryScene[] = useMemo(() => {
    if (!books.length || selectedBookId === "all") return allScenes;
    const filtered = allScenes.filter((sc) => sc.bookId === selectedBookId);
    return filtered.length > 0 ? filtered : allScenes;
  }, [allScenes, books.length, selectedBookId]);

  const visibleIllustrations: StoryIllustration[] = useMemo(() => {
    if (!books.length || selectedBookId === "all") return allIllustrations;
    const filtered = allIllustrations.filter((il) => il.bookId === selectedBookId);
    return filtered.length > 0 ? filtered : allIllustrations;
  }, [allIllustrations, books.length, selectedBookId]);

  const totalScenes = visibleScenes.length;
  const safeSceneIndex = Math.min(activeSceneIndex, Math.max(0, totalScenes - 1));
  const currentScene: StoryScene | undefined = visibleScenes[safeSceneIndex] || visibleScenes[0];

  const totalIllustrations = visibleIllustrations.length;
  const safeIllustrationIndex = Math.min(
    activeIllustrationIndex,
    Math.max(0, totalIllustrations - 1)
  );
  const currentIllustration: StoryIllustration | undefined =
    visibleIllustrations[safeIllustrationIndex] || visibleIllustrations[0];

  // Lưu & khôi phục tiến độ đọc (chương truyện, cấp độ, quyển, cỡ chữ, vị trí cuộn trang)
  const hasHydratedProgressRef = useRef<boolean>(false);
  const appliedProgressVersionRef = useRef<number>(-1);
  const pendingScrollRestoreRef = useRef<{ scrollY: number; scrollRatio: number } | null>(null);
  const suppressScrollCaptureUntilRef = useRef<number>(0);
  const prevActiveViewRef = useRef(activeView);
  const latestStorySnapshotRef = useRef<Omit<
    ReadingProgress,
    "scrollY" | "scrollRatio" | "updatedAt"
  > | null>(null);

  latestStorySnapshotRef.current = selectedStory
    ? {
        storyId: selectedStory.id,
        selectedBookId,
        activeLevel,
        sceneId: currentScene?.id || "",
        sceneIndex: safeSceneIndex,
        illustrationId: currentIllustration?.id || "",
        illustrationIndex: safeIllustrationIndex,
        level1FlowMode,
        level1TextSize,
        level3Scope,
        showContextSection,
      }
    : null;

  // Khôi phục vị trí từ localStorage (và từ tài khoản nếu có bản mới hơn) hoặc áp dụng initialRoute
  useEffect(() => {
    if (!isProgressLoaded || !selectedStory) return;

    if (initialRoute) {
      if (appliedInitialRouteKeyRef.current === initialRouteKey) {
        appliedProgressVersionRef.current = progressVersion;
        return;
      }
      if (selectedStory.id !== initialRoute.storyId) return;

      appliedInitialRouteKeyRef.current = initialRouteKey;
      appliedProgressVersionRef.current = progressVersion;

      const targetBookId = initialRoute.bookId || "all";
      const targetScenes =
        targetBookId === "all"
          ? allScenes
          : allScenes.filter((scene) => scene.bookId === targetBookId);
      const effectiveScenes = targetScenes.length > 0 ? targetScenes : allScenes;
      const targetSceneIndex = initialRoute.sceneId
        ? Math.max(
            0,
            effectiveScenes.findIndex((scene) => scene.id === initialRoute.sceneId)
          )
        : 0;

      if (readingProgress) {
        setLevel1FlowMode(readingProgress.level1FlowMode);
        setLevel1TextSize(readingProgress.level1TextSize);
        setLevel3Scope(readingProgress.level3Scope);
      }

      const sameStory = readingProgress?.storyId === selectedStory.id;
      const matchesExact =
        Boolean(sameStory && readingProgress) &&
        (initialRoute.sceneId
          ? readingProgress!.sceneId === initialRoute.sceneId
          : initialRoute.bookId
          ? readingProgress!.selectedBookId === initialRoute.bookId &&
            readingProgress!.sceneIndex === 0
          : readingProgress!.selectedBookId === "all" &&
            readingProgress!.sceneIndex === 0);

      setSelectedBookId(targetBookId);
      setActiveSceneIndex(targetSceneIndex);
      setShowContextSection(false);
      setUrlGranularity(
        initialRoute.sceneId ? "chapter" : initialRoute.bookId ? "book" : "story"
      );

      if (matchesExact && readingProgress) {
        const targetIllustrations =
          targetBookId === "all"
            ? allIllustrations
            : allIllustrations.filter((il) => il.bookId === targetBookId);
        const effectiveIllustrations =
          targetIllustrations.length > 0 ? targetIllustrations : allIllustrations;
        const resolvedIllIdx = resolveIllustrationIndexFromProgress(
          effectiveIllustrations,
          readingProgress
        );
        setActiveLevel(readingProgress.activeLevel);
        setActiveIllustrationIndex(resolvedIllIdx);
        pendingScrollRestoreRef.current = {
          scrollY: readingProgress.scrollY,
          scrollRatio: readingProgress.scrollRatio,
        };
        suppressScrollCaptureUntilRef.current = Date.now() + 450;
      } else {
        setActiveLevel(1);
        setActiveIllustrationIndex(0);
        pendingScrollRestoreRef.current = null;
      }

      hasHydratedProgressRef.current = true;
      isUrlSyncReadyRef.current = true;
      return;
    }

    if (appliedProgressVersionRef.current === progressVersion) return;
    appliedProgressVersionRef.current = progressVersion;

    if (readingProgress && readingProgress.storyId === selectedStory.id) {
      const nextBookId = readingProgress.selectedBookId || "all";
      const targetScenes =
        nextBookId !== "all"
          ? allScenes.filter((sc) => sc.bookId === nextBookId)
          : allScenes;
      const effectiveScenes = targetScenes.length > 0 ? targetScenes : allScenes;

      const targetIllustrations =
        nextBookId !== "all"
          ? allIllustrations.filter((il) => il.bookId === nextBookId)
          : allIllustrations;
      const effectiveIllustrations =
        targetIllustrations.length > 0 ? targetIllustrations : allIllustrations;

      const resolvedSceneIdx = resolveSceneIndexFromProgress(
        effectiveScenes,
        readingProgress
      );
      const resolvedIllIdx = resolveIllustrationIndexFromProgress(
        effectiveIllustrations,
        readingProgress
      );

      setSelectedBookId(nextBookId);
      setActiveLevel(readingProgress.activeLevel);
      setActiveSceneIndex(resolvedSceneIdx);
      setActiveIllustrationIndex(resolvedIllIdx);
      setLevel1FlowMode(readingProgress.level1FlowMode);
      setLevel1TextSize(readingProgress.level1TextSize);
      setLevel3Scope(readingProgress.level3Scope);

      const restoredScene = effectiveScenes[resolvedSceneIdx];
      if (
        resolvedSceneIdx > 0 ||
        (restoredScene && restoredScene.ord > 1 && nextBookId === "all")
      ) {
        setUrlGranularity("chapter");
      } else if (nextBookId !== "all") {
        setUrlGranularity("book");
      } else {
        setUrlGranularity("story");
      }

      pendingScrollRestoreRef.current = {
        scrollY: readingProgress.scrollY,
        scrollRatio: readingProgress.scrollRatio,
      };
      suppressScrollCaptureUntilRef.current = Date.now() + 450;
    } else {
      setUrlGranularity("story");
    }

    hasHydratedProgressRef.current = true;
    isUrlSyncReadyRef.current = true;
  }, [
    isProgressLoaded,
    progressVersion,
    readingProgress,
    selectedStory,
    allScenes,
    allIllustrations,
    initialRoute,
    initialRouteKey,
  ]);

  // Đồng bộ URL trên thanh địa chỉ trình duyệt và tiêu đề trang (giữ nguyên trang, không làm gián đoạn thu âm)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !isProgressLoaded ||
      !isUrlSyncReadyRef.current ||
      activeView !== "story" ||
      !selectedStory
    ) {
      return;
    }
    if (initialRoute && appliedInitialRouteKeyRef.current !== initialRouteKey) {
      return;
    }

    const targetPath = buildCanonicalRouteUrl({
      storyId: selectedStory.id,
      bookId: selectedBookId,
      sceneId: currentScene?.id,
      granularity: urlGranularity,
    });

    if (targetPath) {
      const mode = pendingHistoryModeRef.current;
      pendingHistoryModeRef.current = "replace";
      if (mode !== "skip" && window.location.pathname !== targetPath) {
        const nextUrl = `${targetPath}${window.location.search}${window.location.hash}`;
        if (mode === "push") {
          window.history.pushState(null, "", nextUrl);
        } else {
          window.history.replaceState(null, "", nextUrl);
        }
      }
    }

    document.title = buildRouteDocumentTitle({
      story: selectedStory,
      bookId: selectedBookId,
      scene: currentScene,
      granularity: urlGranularity,
      lang,
    });
  }, [
    activeView,
    currentScene,
    initialRoute,
    initialRouteKey,
    isProgressLoaded,
    lang,
    selectedBookId,
    selectedStory,
    urlGranularity,
  ]);

  // Hỗ trợ nút Quay lại / Tiến tới (Back/Forward) của trình duyệt
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const resolved = resolveStoryPath(window.location.pathname);
      if (!resolved) return;

      pendingHistoryModeRef.current = "skip";
      const targetStory = storiesRef.current.find((s) => s.id === resolved.storyId);
      const targetBookId = resolved.bookId || "all";
      const scenes = targetStory
        ? targetBookId === "all"
          ? targetStory.scenes
          : targetStory.scenes.filter((sc) => sc.bookId === targetBookId)
        : [];
      const effectiveScenes = scenes.length > 0 ? scenes : targetStory?.scenes || [];
      const nextSceneIdx = resolved.sceneId
        ? Math.max(0, effectiveScenes.findIndex((sc) => sc.id === resolved.sceneId))
        : 0;

      setActiveStoryId(resolved.storyId);
      setSelectedBookId(targetBookId);
      setActiveSceneIndex(nextSceneIdx);
      setActiveAncientBook(null);
      setShowContextSection(false);
      setUrlGranularity(
        resolved.sceneId ? "chapter" : resolved.bookId ? "book" : "story"
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setActiveStoryId]);

  // Chuyển giữa trang đọc truyện và trang Góp ý
  useEffect(() => {
    const prev = prevActiveViewRef.current;
    prevActiveViewRef.current = activeView;
    if (prev === activeView) return;

    if (activeView === "feedback") {
      suppressScrollCaptureUntilRef.current = Date.now() + 300;
      window.scrollTo({ top: 0, behavior: "auto" });
    } else if (activeView === "story" && readingProgress) {
      pendingScrollRestoreRef.current = {
        scrollY: readingProgress.scrollY,
        scrollRatio: readingProgress.scrollRatio,
      };
      suppressScrollCaptureUntilRef.current = Date.now() + 450;
    }
  }, [activeView, readingProgress]);

  // Khôi phục chính xác vị trí cuộn trang sau khi nội dung chương đã render xong
  useEffect(() => {
    if (activeView !== "story") return;
    if (!pendingScrollRestoreRef.current) return;

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        const target = pendingScrollRestoreRef.current;
        if (!target) return;
        pendingScrollRestoreRef.current = null;
        const targetY = computeTargetScrollY(
          target.scrollRatio,
          target.scrollY,
          document.documentElement.scrollHeight,
          window.innerHeight
        );
        suppressScrollCaptureUntilRef.current = Date.now() + 250;
        window.scrollTo({ top: targetY, behavior: "auto" });
      });
    });

    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [
    activeView,
    progressVersion,
    selectedBookId,
    activeLevel,
    safeSceneIndex,
    safeIllustrationIndex,
    level1FlowMode,
    level1TextSize,
    level3Scope,
    showContextSection,
  ]);

  const persistCurrentReadingProgress = useCallback(() => {
    if (
      !hasHydratedProgressRef.current ||
      pendingScrollRestoreRef.current !== null ||
      activeView !== "story" ||
      Date.now() < suppressScrollCaptureUntilRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }
    const snap = latestStorySnapshotRef.current;
    if (!snap) return;

    const scrollY = Math.max(0, Math.round(window.scrollY));
    const scrollRatio = computeScrollRatio(
      scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    updateReadingProgress({
      ...snap,
      scrollY,
      scrollRatio,
      updatedAt: new Date().toISOString(),
    });
  }, [activeView, updateReadingProgress]);

  // Lưu tiến độ khi người đọc chuyển chương, cấp độ, quyển hoặc tuỳ chọn hiển thị
  useEffect(() => {
    if (
      !hasHydratedProgressRef.current ||
      pendingScrollRestoreRef.current !== null ||
      activeView !== "story"
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      persistCurrentReadingProgress();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [
    activeView,
    selectedBookId,
    activeLevel,
    safeSceneIndex,
    safeIllustrationIndex,
    level1FlowMode,
    level1TextSize,
    level3Scope,
    showContextSection,
    persistCurrentReadingProgress,
  ]);

  // Lưu tiến độ cuộn trang liên tục (debounce 200ms)
  useEffect(() => {
    if (activeView !== "story") return;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      if (
        !hasHydratedProgressRef.current ||
        pendingScrollRestoreRef.current !== null ||
        Date.now() < suppressScrollCaptureUntilRef.current
      ) {
        return;
      }
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        persistCurrentReadingProgress();
      }, 200);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [activeView, persistCurrentReadingProgress]);

  const scrollReadingSurfaceIfNeeded = useCallback(() => {
    if (typeof window === "undefined") return;
    const el = readingSurfaceRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 12) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const goToScene = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(Math.max(0, totalScenes - 1), index));
      pendingHistoryModeRef.current = "push";
      setUrlGranularity("chapter");
      setActiveSceneIndex(clamped);
      if (!isRecorderActive) setIsRecorderExpanded(false);
      scrollReadingSurfaceIfNeeded();
    },
    [totalScenes, isRecorderActive, scrollReadingSurfaceIfNeeded]
  );

  const handleSelectLevel = useCallback(
    (lvl: PracticeLevel) => {
      setActiveLevel(lvl);
      if (!isRecorderActive) setIsRecorderExpanded(false);
    },
    [isRecorderActive]
  );

  const handleStorySelect = useCallback(
    (nextStoryId: string) => {
      if (nextStoryId === activeStoryId) return;
      pendingHistoryModeRef.current = "push";
      setUrlGranularity("story");
      setSelectedBookId("all");
      setActiveSceneIndex(0);
      setActiveIllustrationIndex(0);
      setActiveAncientBook(null);
      setActiveStoryId(nextStoryId);
      if (!isRecorderActive) setIsRecorderExpanded(false);
    },
    [activeStoryId, isRecorderActive, setActiveStoryId]
  );

  const handleBookSelect = (bookId: string) => {
    pendingHistoryModeRef.current = "push";
    setUrlGranularity(bookId === "all" ? "story" : "book");
    setSelectedBookId(bookId);
    setActiveSceneIndex(0);
    setActiveIllustrationIndex(0);
    if (!isRecorderActive) setIsRecorderExpanded(false);
  };

  const handlePrevScene = useCallback(() => {
    goToScene(safeSceneIndex - 1);
  }, [goToScene, safeSceneIndex]);

  const handleNextScene = useCallback(() => {
    goToScene(safeSceneIndex + 1);
  }, [goToScene, safeSceneIndex]);

  const handlePrevIllustration = useCallback(() => {
    setActiveIllustrationIndex((prev) => Math.max(0, prev - 1));
    if (!isRecorderActive) setIsRecorderExpanded(false);
  }, [isRecorderActive]);

  const handleNextIllustration = useCallback(() => {
    setActiveIllustrationIndex((prev) =>
      Math.min(Math.max(0, totalIllustrations - 1), prev + 1)
    );
    if (!isRecorderActive) setIsRecorderExpanded(false);
  }, [totalIllustrations, isRecorderActive]);

  const handleJumpToIllustration = (illustrationId?: string) => {
    if (illustrationId) {
      const idx = visibleIllustrations.findIndex((il) => il.id === illustrationId);
      if (idx >= 0) {
        setActiveIllustrationIndex(idx);
      }
    }
    handleSelectLevel(4);
  };

  // Điều hướng bàn phím ← / → để chuyển chương hoặc chuyển tranh
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (activeLevel === 4) {
        if (e.key === "ArrowLeft") handlePrevIllustration();
        else if (e.key === "ArrowRight") handleNextIllustration();
      } else {
        if (e.key === "ArrowLeft") handlePrevScene();
        else if (e.key === "ArrowRight") handleNextScene();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeLevel, handlePrevIllustration, handleNextIllustration, handlePrevScene, handleNextScene]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length !== 1) return;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    touchLastRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.targetTouches.length !== 1) return;
    touchLastRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    const end = touchLastRef.current;
    touchStartRef.current = null;
    touchLastRef.current = null;
    if (!start || !end) return;

    const deltaX = start.x - end.x;
    const deltaY = start.y - end.y;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      lastSwipeAtRef.current = Date.now();
      if (activeLevel === 4) {
        if (deltaX > 0) handleNextIllustration();
        else handlePrevIllustration();
      } else {
        if (deltaX > 0) handleNextScene();
        else handlePrevScene();
      }
    }
  };

  const isInteractiveTap = (e: React.MouseEvent<HTMLElement>): boolean => {
    if (Date.now() - lastSwipeAtRef.current < 350) return true;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, select, input, label, audio, summary, textarea")) return true;
    const selection = typeof window !== "undefined" ? window.getSelection()?.toString() : "";
    return Boolean(selection && selection.trim().length > 0);
  };

  // Chạm nửa phải màn hình: cuộn xuống 1 trang (giữ lại 10% trang cũ để đọc liền mạch); nửa trái: cuộn lên 1 trang
  const handleReadingSurfaceClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isInteractiveTap(e) || typeof window === "undefined") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX =
      rect.width > 0
        ? (e.clientX - rect.left) / rect.width
        : e.clientX / Math.max(1, window.innerWidth);
    const direction: "down" | "up" = relX < 0.5 ? "up" : "down";

    const visualHeight = window.visualViewport?.height;
    const viewportHeight =
      typeof visualHeight === "number" && Number.isFinite(visualHeight) && visualHeight > 0
        ? Math.min(window.innerHeight, visualHeight)
        : window.innerHeight;

    const headerRect = document.querySelector("header")?.getBoundingClientRect();
    const topObstruction =
      headerRect && headerRect.bottom > 0 && headerRect.top <= 1
        ? Math.max(0, headerRect.bottom)
        : 0;

    let bottomObstruction = 0;
    if (isRecorderExpanded && recorderDockRef.current) {
      const dockRect = recorderDockRef.current.getBoundingClientRect();
      const overlapsHorizontally =
        dockRect.width > 0 && dockRect.left < rect.right && dockRect.right > rect.left;
      if (overlapsHorizontally && dockRect.top < viewportHeight) {
        bottomObstruction = Math.max(0, viewportHeight - dockRect.top);
      }
    }

    const scrollStep = computePageScrollStep({
      viewportHeight,
      direction,
      currentScrollY: window.scrollY,
      topObstruction,
      bottomObstruction,
      overlapRatio: PAGE_SCROLL_OVERLAP_RATIO,
    });
    if (scrollStep <= 0) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    window.scrollBy({
      top: direction === "up" ? -scrollStep : scrollStep,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  // Chạm nửa trái / phải khung tranh Level 4 để chuyển tranh trước / sau
  const handleIllustrationCanvasClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isInteractiveTap(e)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.5) handlePrevIllustration();
    else handleNextIllustration();
  };

  const handleSyncRepoClick = async () => {
    setFailedRepoImages({});
    ancientCacheRef.current = {};
    await syncFromRepo({ force: true, storyId: selectedStory?.id });
  };

  const handleExportPdf = async (includeImages: boolean = true) => {
    if (!selectedStory || isExportingPdf) return;
    setIsPdfMenuOpen(false);
    setPdfError("");
    setIsExportingPdf(true);
    try {
      let targetStory = selectedStory;
      if (!hasFullStoryPassages(targetStory)) {
        const synced = await syncFromRepo({
          force: true,
          storyId: selectedStory.id,
        });
        if (synced) {
          targetStory = synced;
        }
      }
      if (!hasFullStoryPassages(targetStory)) {
        setPdfError(t.story.pdf.syncRequiredNotice);
        return;
      }
      await exportStoryToPdf(targetStory, {
        bookId: "all",
        failedImages: failedRepoImages,
        preferProceduralArt,
        lang,
        includeImages,
      });
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : t.story.pdf.errorNotice);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenAncientBook = async (book: AncientBookItem) => {
    if (activeAncientBook?.id === book.id) {
      setActiveAncientBook(null);
      return;
    }
    setActiveAncientBook(book);
    setAncientBookError("");

    const cacheKey = `${selectedStory?.id || "story"}:${lang}:${book.file}`;
    const cached = ancientCacheRef.current[cacheKey];
    if (cached) {
      setAncientBookContent(cached);
      return;
    }

    setAncientBookLoading(true);
    setAncientBookContent("");
    try {
      const md = await fetchAncientBookMarkdown(
        book.file,
        selectedStory?.rawBaseUrl ||
          (selectedStory?.id === EARTH_STORY_ID
            ? EARTH_JSDELIVR_BASE_URL
            : GENESIS_JSDELIVR_BASE_URL),
        {
          repo: selectedStory?.id === EARTH_STORY_ID ? "earth" : "genesis",
        }
      );
      ancientCacheRef.current[cacheKey] = md;
      setAncientBookContent(md);
    } catch (err) {
      setAncientBookError(
        err instanceof Error ? err.message : "Không thể tải văn bản cổ từ repo."
      );
    } finally {
      setAncientBookLoading(false);
    }
  };

  // Đổi chất liệu tranh dự phòng cho bức tranh hiện tại (Level 4)
  const handleIllustrationArtStyleChange = (style: WaldorfArtStyle) => {
    if (!selectedStory || !currentIllustration) return;
    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((story) => {
        if (story.id !== selectedStory.id) return story;
        return {
          ...story,
          illustrations: story.illustrations.map((il) =>
            il.id === currentIllustration.id ? { ...il, artStyle: style } : il
          ),
          scenes: story.scenes.map((sc) =>
            sc.illustrationId === currentIllustration.id ? { ...sc, artStyle: style } : sc
          ),
        };
      }),
    }));
  };

  // Tải tranh vẽ tay tùy chọn từ máy cho bức tranh hiện tại (Level 4)
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStory || !currentIllustration) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = typeof ev.target?.result === "string" ? ev.target.result : null;
      if (!dataUrl) return;
      updateData((prev) => ({
        ...prev,
        stories: prev.stories.map((story) => {
          if (story.id !== selectedStory.id) return story;
          return {
            ...story,
            illustrations: story.illustrations.map((il) =>
              il.id === currentIllustration.id ? { ...il, imagePath: dataUrl } : il
            ),
            scenes: story.scenes.map((sc) =>
              sc.illustrationId === currentIllustration.id ? { ...sc, imagePath: dataUrl } : sc
            ),
          };
        }),
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleResetIllustrationImage = () => {
    if (!selectedStory || !currentIllustration) return;
    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((story) => {
        if (story.id !== selectedStory.id) return story;
        return {
          ...story,
          illustrations: story.illustrations.map((il) =>
            il.id === currentIllustration.id ? { ...il, imagePath: null } : il
          ),
          scenes: story.scenes.map((sc) =>
            sc.illustrationId === currentIllustration.id ? { ...sc, imagePath: null } : sc
          ),
        };
      }),
    }));
  };

  // Bắt đầu thu âm (hỗ trợ tạm dừng/tiếp tục trong cùng một bản thu, không phân tích AI)
  const startRecording = async () => {
    if (recordingStatus !== "idle" || isStartingRecordingRef.current) return;
    setMicError("");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMicError(t.story.recorder.unsupportedNotice);
      return;
    }

    isStartingRecordingRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (isUnmountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = pickSupportedAudioMimeType((m) => MediaRecorder.isTypeSupported(m));
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      timerStateRef.current = startRecordingTimer(Date.now());
      setRecordingStatus("recording");
      setRecordingSeconds(0);
      startTickInterval();

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onpause = () => {
        if (timerStateRef.current.status === "recording") {
          timerStateRef.current = pauseRecordingTimer(timerStateRef.current, Date.now());
        }
        stopTickInterval();
        setRecordingSeconds(getRecordedDisplaySeconds(timerStateRef.current, Date.now()));
        setRecordingStatus("paused");
      };

      recorder.onresume = () => {
        if (timerStateRef.current.status === "paused") {
          timerStateRef.current = resumeRecordingTimer(timerStateRef.current, Date.now());
        }
        setRecordingStatus("recording");
        startTickInterval();
      };

      recorder.onerror = () => {
        resetActiveRecorderState();
        releaseRecorderHandles();
        audioChunksRef.current = [];
        setMicError(t.story.recorder.recordingErrorNotice);
      };

      const capturedLevel = activeLevel;
      const capturedAncientBook = showContextSection ? activeAncientBook : null;
      const capturedOrd =
        capturedLevel === 4
          ? currentIllustration?.ord || safeIllustrationIndex + 1
          : currentScene?.ord || safeSceneIndex + 1;
      const capturedUnitLabel =
        capturedLevel === 4
          ? t.story.level4.illustrationLabel
          : t.story.nav.sceneLabel;
      const capturedStoryId = selectedStory?.id || "story";

      recorder.onstop = () => {
        const durationSeconds = getFinalRecordedDurationSeconds(
          timerStateRef.current,
          Date.now()
        );
        resetActiveRecorderState();
        releaseRecorderHandles();

        if (isUnmountedRef.current) {
          audioChunksRef.current = [];
          return;
        }

        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        if (chunks.length === 0) return;

        const blobType = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunks, { type: blobType });
        const audioUrl = URL.createObjectURL(blob);

        const recId = `rec-${Date.now()}`;
        const label = capturedAncientBook
          ? `${t.story.recorder.ancientTextPrefix} · ${capturedAncientBook.title}`
          : `Level ${capturedLevel} · ${capturedUnitLabel} ${capturedOrd}`;
        const newRec: VoiceRecording = {
          id: recId,
          storyId: capturedStoryId,
          level: capturedAncientBook ? undefined : capturedLevel,
          sceneOrd: capturedAncientBook ? 0 : capturedOrd,
          label,
          ancientBookId: capturedAncientBook?.id,
          ancientBookTitle: capturedAncientBook?.title,
          audioUrl,
          mimeType: blobType,
          durationSeconds,
          createdAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setRecordings((prev) => [newRec, ...prev]);
        setActiveRecordingId(recId);
      };

      recorder.start();
    } catch (err) {
      console.warn("Microphone error:", err);
      resetActiveRecorderState();
      releaseRecorderHandles();
      setMicError(t.story.recorder.micDeniedNotice);
    } finally {
      isStartingRecordingRef.current = false;
    }
  };

  const pauseRecording = () => {
    setMicError("");
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    if (!supportsMediaRecorderPause(recorder)) {
      setMicError(t.story.recorder.pauseUnsupportedNotice);
      return;
    }
    try {
      recorder.pause();
      const now = Date.now();
      timerStateRef.current = pauseRecordingTimer(timerStateRef.current, now);
      stopTickInterval();
      setRecordingSeconds(getRecordedDisplaySeconds(timerStateRef.current, now));
      setRecordingStatus("paused");
    } catch {
      setMicError(t.story.recorder.pauseUnsupportedNotice);
    }
  };

  const resumeRecording = () => {
    setMicError("");
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    if (!supportsMediaRecorderPause(recorder)) {
      setMicError(t.story.recorder.pauseUnsupportedNotice);
      return;
    }
    try {
      recorder.resume();
      timerStateRef.current = resumeRecordingTimer(timerStateRef.current, Date.now());
      setRecordingStatus("recording");
      startTickInterval();
    } catch {
      setMicError(t.story.recorder.pauseUnsupportedNotice);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
        return;
      } catch {}
    }
    resetActiveRecorderState();
    releaseRecorderHandles();
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.audioUrl);
        } catch {}
      }
      const next = prev.filter((r) => r.id !== id);
      if (activeRecordingId === id) {
        setActiveRecordingId(next[0]?.id || null);
      }
      return next;
    });
  };

  const activeRecording =
    recordings.find((r) => r.id === activeRecordingId) || recordings[0] || null;

  const displayTitle = selectedStory
    ? lang === "en" && selectedStory.titleEn
      ? selectedStory.titleEn
      : selectedStory.title
    : "";

  // Bối cảnh & Linh hồn câu chuyện theo Quyển đang chọn
  const activeBookIdForSoul =
    selectedBookId !== "all" ? selectedBookId : currentScene?.bookId || "quyen-1";
  const activeSoul =
    selectedStory?.soul.bookSouls?.[activeBookIdForSoul] || selectedStory?.soul;

  // Đường dẫn ảnh Level 4 qua CDN (chỉ tải khi story-index xác nhận imageGenerated = true)
  const repoImageCandidates = useMemo(() => {
    if (
      !currentIllustration?.imageGenerated ||
      !currentIllustration?.repoImage ||
      preferProceduralArt ||
      currentIllustration?.imagePath
    ) {
      return [];
    }
    const repo = selectedStory?.id === EARTH_STORY_ID ? "earth" : "genesis";
    return getCandidateRepoBaseUrls(selectedStory?.rawBaseUrl, { repo }).map(
      (base) => buildRepoFileUrl(currentIllustration.repoImage, base)
    );
  }, [currentIllustration, preferProceduralArt, selectedStory?.rawBaseUrl]);

  const repoImgUrl = repoImageCandidates.find((u) => !failedRepoImages[u]) || "";
  const shouldShowRepoImg = Boolean(!currentIllustration?.imagePath && repoImgUrl);
  const hasVisibleLevel4Image =
    Boolean(currentIllustration?.imagePath) ||
    shouldShowRepoImg ||
    Boolean(
      currentIllustration?.imageGenerated &&
      !preferProceduralArt &&
      selectedStory?.id !== EARTH_STORY_ID
    );
  const level4ImgSrc =
    currentIllustration && hasVisibleLevel4Image
      ? currentIllustration.imagePath
        ? currentIllustration.imagePath
        : shouldShowRepoImg
        ? repoImgUrl
        : ProceduralIllustrator.generateArtSVG(
            currentIllustration,
            currentIllustration.artStyle
          )
      : "";

  const activeRepoPath = getActiveRepoPath({
    level: activeLevel,
    showContextSection,
    scene: currentScene,
    illustration: currentIllustration,
    overviewPath: selectedStory?.soul.overviewPath,
  });

  const ancientBooks = selectedStory?.soul.ancientBooks || [];
  const filteredAncientBooks = useMemo(() => {
    if (ancientCategory === "all") return ancientBooks;
    return ancientBooks.filter((ab) => ab.category === ancientCategory);
  }, [ancientBooks, ancientCategory]);
  const lastSyncedText = formatLastSynced(selectedStory?.lastSyncedAt, lang);
  const currentChapterLabel = currentScene
    ? `${books.find((b) => b.id === currentScene.bookId)?.title || ""} · ${currentScene.title}`.replace(
        /^\s*·\s*/,
        ""
      )
    : undefined;

  if (activeView === "feedback") {
    return (
      <FeedbackSection
        currentChapterLabel={currentChapterLabel}
        onBackToStory={() => setActiveView("story")}
      />
    );
  }

  return (
    <div className="space-y-4 pb-20 sm:pb-24">
      {selectedStory && (
        <section className="flex flex-wrap items-center gap-2">
          {data.stories.length > 1 && (
            <label className="btn-ghost text-xs py-2 px-2 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              <select
                value={activeStoryId}
                onChange={(event) => handleStorySelect(event.target.value)}
                className="bg-transparent text-ink outline-none max-w-[13rem]"
                aria-label={lang === "vi" ? "Chọn truyện" : "Choose story"}
              >
                {data.stories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {lang === "en" && story.titleEn ? story.titleEn : story.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <LevelSelectDropdown
            activeLevel={activeLevel}
            levels={t.story.levels}
            isOpen={isLevelMenuOpen}
            onToggle={() => setIsLevelMenuOpen((v) => !v)}
            onSelect={(lvl) => {
              handleSelectLevel(lvl);
              setIsLevelMenuOpen(false);
            }}
            menuRef={levelMenuRef}
            label={t.story.nav.levelSelectLabel}
          />

          <button
            type="button"
            aria-expanded={showContextSection}
            onClick={() => {
              setIsLevelMenuOpen(false);
              setShowContextSection((prev) => {
                const next = !prev;
                if (next) setShowUtilitiesSection(false);
                return next;
              });
            }}
            className={`btn-ghost text-xs py-2 px-3 ${
              showContextSection ? "bg-[#E3EFE0] border-forest" : ""
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.story.utilities.contextButton}</span>
            {showContextSection ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            aria-expanded={showUtilitiesSection}
            onClick={() => {
              setIsLevelMenuOpen(false);
              setShowUtilitiesSection((prev) => {
                const next = !prev;
                if (next) setShowContextSection(false);
                return next;
              });
            }}
            className={`btn-ghost text-xs py-2 px-3 ${
              showUtilitiesSection ? "bg-[#E3EFE0] border-forest" : ""
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>{t.story.utilities.openButton}</span>
            {showUtilitiesSection ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </section>
      )}

      {(syncError || pdfError) && (
        <div
          role="alert"
          className="text-xs text-terra bg-[#FDF2F0] border border-terra/30 rounded-lg px-3 py-2"
        >
          {pdfError || syncError}
        </div>
      )}

      {selectedStory && showUtilitiesSection && (
        <section
          aria-label={t.story.utilities.openButton}
          className="garden-card bg-[#FCF9F2] border-2 border-forest/20 space-y-4"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
            <h2 className="font-serif text-lg font-bold text-forestDark flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-forest" />
              <span>{t.story.utilities.openButton}</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowUtilitiesSection(false)}
              className="btn-ghost text-xs py-1 px-2.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.story.utilities.closeButton}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-line bg-[#FFFDF8] space-y-2">
              <h3 className="font-serif font-bold text-forestDark">
                {t.story.utilities.introTitle}
              </h3>
              <p className="text-xs font-semibold text-forest">{displayTitle}</p>
              <p className="text-xs text-inkSoft">{t.story.utilities.epicSummary}</p>
              <p className="text-sm text-ink leading-relaxed">
                {t.story.utilities.levelGuide}
              </p>
              <p className="text-xs text-inkSoft leading-relaxed">
                {t.story.utilities.tapGuide}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-line bg-[#FFFDF8] space-y-3">
              <h3 className="font-serif font-bold text-forestDark">
                {t.story.utilities.toolsTitle}
              </h3>

              <PdfExportDropdown
                isOpen={isPdfMenuOpen}
                isExporting={isExportingPdf}
                onToggle={() => setIsPdfMenuOpen((v) => !v)}
                onSelect={(includeImages) => void handleExportPdf(includeImages)}
                menuRef={pdfMenuRef}
                copy={t.story.pdf}
              />

              <div className="space-y-1.5 pt-1 border-t border-line/60">
                <p className="text-xs font-semibold text-forestDark">
                  {t.story.utilities.level1ModeLabel}
                </p>
                <div className="inline-flex flex-wrap rounded-lg border border-line bg-white p-1 gap-1">
                  <button
                    type="button"
                    aria-pressed={level1FlowMode === "scene"}
                    onClick={() => setLevel1FlowMode("scene")}
                    className={`px-2 py-1 text-xs rounded ${
                      level1FlowMode === "scene"
                        ? "bg-forest text-white"
                        : "text-forestDark hover:bg-[#FAF3E3]"
                    }`}
                  >
                    {t.story.level1.viewByScene}
                  </button>
                  <button
                    type="button"
                    aria-pressed={level1FlowMode === "full"}
                    onClick={() => setLevel1FlowMode("full")}
                    className={`px-2 py-1 text-xs rounded ${
                      level1FlowMode === "full"
                        ? "bg-forest text-white"
                        : "text-forestDark hover:bg-[#FAF3E3]"
                    }`}
                  >
                    {t.story.level1.viewFullFlow}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-line/60">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <p className="text-xs font-semibold text-forestDark">
                    {t.story.utilities.artTitle}
                  </p>
                  {selectedStory?.id !== EARTH_STORY_ID || shouldShowRepoImg || currentIllustration?.imagePath ? (
                    <span className="badge-sand text-[10px]">
                      {shouldShowRepoImg || currentIllustration?.imagePath
                        ? t.story.level4.artModeRepoBadge
                        : t.story.level4.artModeProceduralBadge}
                    </span>
                  ) : null}
                </div>
                <select
                  aria-label={t.story.level4.artStyleLabel}
                  value={currentIllustration?.artStyle || "wet-on-wet"}
                  onChange={(e) => {
                    setPreferProceduralArt(true);
                    handleIllustrationArtStyleChange(e.target.value as WaldorfArtStyle);
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-line bg-white text-xs text-ink"
                >
                  <option value="wet-on-wet">{t.story.level4.styleWetOnWet}</option>
                  <option value="crayon">{t.story.level4.styleCrayon}</option>
                  <option value="chalkboard">{t.story.level4.styleChalkboard}</option>
                </select>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={customImageInputRef}
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => customImageInputRef.current?.click()}
                    className="btn-ghost text-xs py-1.5 px-2.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.story.level4.uploadCustomImageBtn}</span>
                  </button>
                  {(currentIllustration?.imagePath || preferProceduralArt) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreferProceduralArt(false);
                        handleResetIllustrationImage();
                      }}
                      className="btn-ghost text-xs py-1.5 px-2.5 text-terra"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.story.level4.resetProceduralBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-line bg-[#FFFDF8] space-y-2.5">
              <h3 className="font-serif font-bold text-forestDark">
                {t.story.utilities.sourceTitle}
              </h3>

              <div className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3EFE0]/85 text-forestDark text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                <span>{t.story.repo.syncedLabel}</span>
                {lastSyncedText && (
                  <span className="text-[11px] text-inkSoft font-normal">
                    · {lastSyncedText}
                  </span>
                )}
              </div>

              {syncNotice && !syncError && (
                <p className="text-xs text-forestDark bg-[#E3EFE0]/60 border border-forest/20 rounded-lg px-2.5 py-1.5">
                  {syncNotice}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {selectedStory.repoUrl && (
                  <button
                    type="button"
                    onClick={handleSyncRepoClick}
                    disabled={isSyncingRepo}
                    className="btn-ghost text-xs py-1.5 px-2.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-forest ${
                        isSyncingRepo ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {isSyncingRepo ? t.story.repo.syncing : t.story.repo.syncBtn}
                    </span>
                  </button>
                )}
              </div>

              {activeRepoPath && selectedStory.repoUrl && (
                <a
                  href={buildGitHubBlobUrl(
                    activeRepoPath,
                    selectedStory.repoUrl || GENESIS_REPO_URL
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-forestDark hover:underline break-all"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                  <code className="text-terra text-[11px] truncate max-w-[210px]">
                    {activeRepoPath}
                  </code>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* MỤC ĐỌC THÊM: BỐI CẢNH & LINH HỒN CÂU CHUYỆN (LEVEL 0 CŨ)         */}
      {/* ================================================================== */}
      {selectedStory && showContextSection && activeSoul && (
        <section
          aria-label={t.story.contextSection.title}
          className="garden-card bg-[#FCF9F2] border-2 border-forest/25 space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-forestDark flex items-center gap-2">
                <Compass className="w-5 h-5 text-forest" />
                <span>{t.story.contextSection.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-inkSoft mt-0.5 leading-relaxed">
                {t.story.contextSection.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowContextSection(false)}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.story.contextSection.closeBtn}</span>
            </button>
          </div>

          {(books.length > 0 || selectedStory.soul.overviewMarkdown) && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFFDF8] px-4 py-2.5 rounded-xl border border-line">
              {books.length > 0 ? (
                <div className="text-xs font-serif font-semibold text-forestDark">
                  {books.find((b) => b.id === activeBookIdForSoul)?.title || books[0]?.title} —{" "}
                  <span className="font-normal text-inkSoft">
                    {books.find((b) => b.id === activeBookIdForSoul)?.subtitle ||
                      books[0]?.subtitle}
                  </span>
                </div>
              ) : (
                <span />
              )}

              {selectedStory.soul.overviewMarkdown && (
                <button
                  type="button"
                  onClick={() => setShowEpicOverview((v) => !v)}
                  aria-expanded={showEpicOverview}
                  className="btn-ghost text-xs py-1 px-2.5"
                >
                  <ScrollText className="w-3.5 h-3.5 text-forest" />
                  <span>
                    {showEpicOverview
                      ? t.story.contextSection.epicOverviewToggleClose
                      : t.story.contextSection.epicOverviewToggleOpen}
                  </span>
                </button>
              )}
            </div>
          )}

          {showEpicOverview && selectedStory.soul.overviewMarkdown && (
            <div className="garden-card bg-[#FFFDF9] border-forest/30 space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
                <h3 className="font-serif text-base font-bold text-forestDark flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-forest" />
                  <span>{t.story.contextSection.epicOverviewToggleOpen}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEpicOverview(false)}
                  className="btn-ghost text-xs py-1 px-2"
                  aria-label={t.story.contextSection.epicOverviewToggleClose}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto text-sm text-ink leading-relaxed whitespace-pre-line pr-2 font-serif">
                {formatMarkdownForReading(selectedStory.soul.overviewMarkdown)}
              </div>
            </div>
          )}

          {activeAncientBook ? (
            <div className="reading-surface ancient-text-reading-surface space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveAncientBook(null)}
                    className="btn-ghost text-xs py-1 px-2.5 mb-3"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{t.story.contextSection.ancientReaderBack}</span>
                  </button>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-forestDark">
                    {activeAncientBook.title}
                  </h3>
                  <code className="text-[11px] text-terra break-all">{activeAncientBook.file}</code>
                </div>
                <a
                  href={buildGitHubBlobUrl(
                    activeAncientBook.file,
                    selectedStory.repoUrl || GENESIS_REPO_URL
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-forest font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <span>{t.story.contextSection.ancientReaderSource}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {ancientBookLoading ? (
                <p className="text-sm text-inkSoft italic">
                  {t.story.repo.ancientBookLoading}
                </p>
              ) : ancientBookError ? (
                <p className="text-sm text-terra" role="alert">
                  {ancientBookError}
                </p>
              ) : ancientBookContent ? (
                <article
                  onClick={handleReadingSurfaceClick}
                  className="max-w-[68ch] mx-auto font-serif text-base sm:text-lg leading-[1.85] text-ink whitespace-pre-line cursor-pointer select-text"
                >
                  {formatMarkdownForReading(ancientBookContent)}
                </article>
              ) : null}
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="garden-card space-y-2.5 bg-[#FFFDF8]">
              <div className="flex items-center gap-2 text-forestDark font-serif font-bold text-base">
                <Compass className="w-4 h-4 text-forest flex-shrink-0" />
                <h3>{t.story.contextSection.culturalSpiritTitle}</h3>
              </div>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                {activeSoul.culturalSpirit}
              </p>
            </div>

            <div className="garden-card space-y-2.5 bg-[#FFFDF8]">
              <div className="flex items-center gap-2 text-forestDark font-serif font-bold text-base">
                <Wind className="w-4 h-4 text-terra flex-shrink-0" />
                <h3>{t.story.contextSection.rhythmTitle}</h3>
              </div>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                {activeSoul.storytellingRhythm}
              </p>
            </div>

            <div className="garden-card space-y-2.5 bg-[#FFFDF8]">
              <div className="flex items-center gap-2 text-forestDark font-serif font-bold text-base">
                <Heart className="w-4 h-4 text-terra flex-shrink-0" />
                <h3>{t.story.contextSection.metaphorTitle}</h3>
              </div>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                {activeSoul.ageMetaphor}
              </p>
            </div>
          </div>

          {/* Cách phát âm tên cổ & địa danh */}
          <div className="garden-card space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-line">
              <Volume2 className="w-4 h-4 text-forest" />
              <h3 className="font-serif text-base font-bold text-forestDark">
                {t.story.contextSection.pronunciationTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSoul.pronunciations.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#FDFBF5] border border-line space-y-1"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-serif font-bold text-base text-forestDark">
                      {item.term}
                    </span>
                    <span className="text-xs font-medium text-terra bg-[#F7DDD6]/60 px-2 py-0.5 rounded-full">
                      {item.pronunciation}
                    </span>
                  </div>
                  <p className="text-xs text-inkSoft leading-relaxed">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Thư viện Văn bản cổ đọc thêm (level-0-khong-gian-boi-canh/van-ban-co/) */}
          {ancientBooks.length > 0 && (
            <div className="garden-card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line">
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-forest" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-forestDark">
                      {t.story.repo.ancientBooksTitle} ({ancientBooks.length})
                    </h3>
                    <p className="text-[11px] text-inkSoft">
                      {t.story.repo.ancientBooksSubtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label={t.story.repo.ancientBooksTitle}
              >
                {ANCIENT_CATEGORIES.map((cat) => {
                  const count =
                    cat === "all"
                      ? ancientBooks.length
                      : ancientBooks.filter((ab) => ab.category === cat).length;
                  if (cat !== "all" && count === 0) return null;
                  const label =
                    cat === "all"
                      ? t.story.repo.allCategoriesOption
                      : t.story.repo.categories[cat];
                  const active = ancientCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setAncientCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                        active
                          ? "bg-forest text-white border-forest"
                          : "bg-white text-inkSoft border-line hover:bg-[#FAF3E3]"
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {filteredAncientBooks.map((ab) => {
                  return (
                    <button
                      key={ab.id}
                      type="button"
                      aria-pressed={false}
                      onClick={() => handleOpenAncientBook(ab)}
                      className="px-2.5 py-1.5 rounded-lg text-xs border transition text-left bg-[#FDFBF5] text-ink border-line hover:border-forest/50 hover:bg-[#FAF3E3]"
                    >
                      {ab.title}
                    </button>
                  );
                })}
              </div>

            </div>
          )}
            </>
          )}
        </section>
      )}

      {/* ================================================================== */}
      {/* THANH CHỌN 4 LEVEL LUYỆN TẬP (LEVEL 1 → LEVEL 4)                  */}
      {/* ================================================================== */}
      {selectedStory && !activeAncientBook && (
        <section className="space-y-4">
          {/* ============================================================== */}
          {/* LEVEL 1: TOÀN VĂN CÂU CHUYỆN + LƯU Ý GIỌNG KỂ                  */}
          {/* ============================================================== */}
          {activeLevel === 1 && (
            <div ref={readingSurfaceRef} className="reading-surface space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <BookSelectDropdown
                    books={books}
                    totalChapters={allScenes.length}
                    selectedBookId={selectedBookId}
                    onSelect={handleBookSelect}
                    lang={lang}
                    storyId={selectedStory.id}
                    ariaLabel={t.story.repo.bookFilterLabel}
                    allBooksLabel={t.story.repo.allBooksOption}
                  />

                  {/* Bộ chọn cỡ chữ đọc thành tiếng */}
                  <div
                    className="inline-flex items-center gap-1 rounded-xl bg-[#F7ECD8]/50 p-1 border border-line"
                    role="group"
                    aria-label={t.story.level1.textSizeLabel}
                  >
                    <Type className="w-3.5 h-3.5 text-forest ml-1.5 mr-0.5" />
                    {(
                      [
                        { id: "sm", label: t.story.level1.textSizeSmall },
                        { id: "md", label: t.story.level1.textSizeMedium },
                        { id: "lg", label: t.story.level1.textSizeLarge },
                      ] as const
                    ).map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        aria-pressed={level1TextSize === sz.id}
                        onClick={() => setLevel1TextSize(sz.id)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                          level1TextSize === sz.id
                            ? "bg-forest text-white shadow-sm"
                            : "text-forestDark hover:bg-white/70"
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {level1FlowMode === "scene" ? (
                  <ChapterNavControls
                    activeIndex={safeSceneIndex}
                    total={totalScenes}
                    scenes={visibleScenes}
                    onPrev={handlePrevScene}
                    onNext={handleNextScene}
                    onSelect={goToScene}
                    sceneLabel={t.story.nav.sceneLabel}
                    prevLabel={t.story.nav.prevScene}
                    nextLabel={t.story.nav.nextScene}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setLevel1FlowMode("scene")}
                    className="btn-ghost text-xs py-1.5 px-2.5"
                  >
                    {t.story.level1.viewByScene}
                  </button>
                )}
              </div>

              {level1FlowMode === "scene" && currentScene ? (
                <div
                  className="space-y-4 max-w-none sm:max-w-[68ch] mx-auto cursor-pointer select-text"
                  onClick={handleReadingSurfaceClick}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      {currentScene.section && (
                        <div className="text-xs font-semibold text-terra uppercase tracking-wide mb-0.5">
                          {formatSceneSection(
                            books.find((b) => b.id === currentScene.bookId)?.title,
                            currentScene.section
                          )}
                        </div>
                      )}
                      <h3 className="font-serif text-xl font-bold text-forestDark">
                        {currentScene.title}
                      </h3>
                    </div>

                    {currentScene.illustrationId && (
                      <button
                        type="button"
                        onClick={() => handleJumpToIllustration(currentScene.illustrationId)}
                        className="btn-ghost text-xs py-1.5 px-2.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-forest" />
                        <span>{t.story.level1.openIllustrationBtn}</span>
                      </button>
                    )}
                  </div>

                  {/* Đặt Lưu ý giọng kể lên đầu để người kể lấy hơi & tông giọng trước khi đọc */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#E3EFE0]/70 border border-[#C5DEC0] space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4" />
                      <span>{t.story.level1.voiceNoteLabel}</span>
                    </div>
                    <p className="text-sm text-forestDark leading-relaxed italic whitespace-pre-line">
                      {currentScene.voiceNote}
                    </p>
                  </div>

                  <p
                    className={`font-serif text-ink whitespace-pre-line ${
                      level1TextSize === "sm"
                        ? "text-[15px] sm:text-base leading-[1.8]"
                        : level1TextSize === "lg"
                        ? "text-lg sm:text-xl leading-[1.9]"
                        : "text-base sm:text-lg leading-[1.85]"
                    }`}
                  >
                    {currentScene.passage}
                  </p>

                  <div className="flex justify-center pt-1">
                    <ChapterNavControls
                      activeIndex={safeSceneIndex}
                      total={totalScenes}
                      scenes={visibleScenes}
                      onPrev={handlePrevScene}
                      onNext={handleNextScene}
                      onSelect={goToScene}
                      sceneLabel={t.story.nav.sceneLabel}
                      prevLabel={t.story.nav.prevScene}
                      nextLabel={t.story.nav.nextScene}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="space-y-6 max-w-none sm:max-w-[68ch] mx-auto py-2 cursor-pointer select-text"
                  onClick={handleReadingSurfaceClick}
                >
                  {visibleScenes.map((sc, idx) => (
                    <div
                      key={sc.id}
                      className="space-y-3 pb-6 border-b border-line/70 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          {sc.section && (
                            <div className="text-[11px] font-semibold text-terra uppercase tracking-wide">
                              {sc.section}
                            </div>
                          )}
                          <h3 className="font-serif text-lg font-bold text-forestDark">
                            {sc.title}
                          </h3>
                        </div>
                        <span className="badge-sand text-[11px]">
                          {idx + 1}/{totalScenes}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#E3EFE0]/60 border border-[#C5DEC0] text-xs text-forestDark italic flex items-start gap-2">
                        <Volume2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="not-italic font-semibold">
                            {t.story.level1.voiceNoteLabel}:{" "}
                          </strong>
                          <span className="whitespace-pre-line">{sc.voiceNote}</span>
                        </div>
                      </div>
                      <p
                        className={`font-serif text-ink whitespace-pre-line ${
                          level1TextSize === "sm"
                            ? "text-sm leading-[1.75]"
                            : level1TextSize === "lg"
                            ? "text-lg leading-[1.9]"
                            : "text-base leading-[1.8]"
                        }`}
                      >
                        {sc.passage}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <LevelStepFooter
                activeLevel={activeLevel}
                onSelectLevel={handleSelectLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 2: DÀN Ý CHI TIẾT (KHÔNG NHÌN TOÀN VĂN)                  */}
          {/* ============================================================== */}
          {activeLevel === 2 && currentScene && currentScene.detailedOutline && (
            <div
              ref={readingSurfaceRef}
              className="reading-surface space-y-5 cursor-pointer select-text"
              onClick={handleReadingSurfaceClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <BookSelectDropdown
                    books={books}
                    totalChapters={allScenes.length}
                    selectedBookId={selectedBookId}
                    onSelect={handleBookSelect}
                    lang={lang}
                    storyId={selectedStory.id}
                    ariaLabel={t.story.repo.bookFilterLabel}
                    allBooksLabel={t.story.repo.allBooksOption}
                  />
                  <div>
                    {currentScene.section && (
                      <div className="text-xs font-semibold text-terra uppercase tracking-wide mb-0.5">
                        {formatSceneSection(
                          books.find((b) => b.id === currentScene.bookId)?.title,
                          currentScene.section
                        )}
                      </div>
                    )}
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-forestDark">
                      {currentScene.title}
                    </h3>
                  </div>
                </div>
                <ChapterNavControls
                  activeIndex={safeSceneIndex}
                  total={totalScenes}
                  scenes={visibleScenes}
                  onPrev={handlePrevScene}
                  onNext={handleNextScene}
                  onSelect={goToScene}
                  sceneLabel={t.story.nav.sceneLabel}
                  prevLabel={t.story.nav.prevScene}
                  nextLabel={t.story.nav.nextScene}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FDFBF5] border border-line space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{t.story.level2.charactersLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentScene.detailedOutline.characters.map((ch, idx) => (
                      <span key={idx} className="badge-leaf text-xs font-semibold">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FDF0E6]/70 border border-[#E8D0B8] space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-terra flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>{t.story.level2.emotionalRhythmLabel}</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed">
                    {currentScene.detailedOutline.emotionalRhythm}
                  </p>
                </div>
              </div>

              {currentScene.detailedOutline.localizedDetails.length > 0 && (
                <div className="p-4 rounded-xl bg-[#FFFDF8] border border-line space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-forestDark flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-terra" />
                    <span>{t.story.level2.localizedDetailsLabel}</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-ink list-disc list-inside">
                    {currentScene.detailedOutline.localizedDetails.map((detail, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#FFFDF8] border border-line space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-forestDark flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-forest" />
                  <span>{t.story.level2.beatsLabel}</span>
                </div>
                <ol className="space-y-2 text-sm text-ink">
                  {currentScene.detailedOutline.beats.map((beat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#E3EFE0] text-forest text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{beat}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex justify-center pt-1">
                <ChapterNavControls
                  activeIndex={safeSceneIndex}
                  total={totalScenes}
                  scenes={visibleScenes}
                  onPrev={handlePrevScene}
                  onNext={handleNextScene}
                  onSelect={goToScene}
                  sceneLabel={t.story.nav.sceneLabel}
                  prevLabel={t.story.nav.prevScene}
                  nextLabel={t.story.nav.nextScene}
                />
              </div>

              <LevelStepFooter
                activeLevel={activeLevel}
                onSelectLevel={handleSelectLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 3: DÀN Ý TÓM TẮT (KHUNG XƯƠNG CỐT TRUYỆN)               */}
          {/* ============================================================== */}
          {activeLevel === 3 && (
            <div
              ref={readingSurfaceRef}
              className={`reading-surface space-y-5 ${
                level3Scope === "current" ? "cursor-pointer select-text" : ""
              }`}
              onClick={level3Scope === "current" ? handleReadingSurfaceClick : undefined}
              onTouchStart={level3Scope === "current" ? handleTouchStart : undefined}
              onTouchMove={level3Scope === "current" ? handleTouchMove : undefined}
              onTouchEnd={level3Scope === "current" ? handleTouchEnd : undefined}
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <BookSelectDropdown
                    books={books}
                    totalChapters={allScenes.length}
                    selectedBookId={selectedBookId}
                    onSelect={handleBookSelect}
                    lang={lang}
                    storyId={selectedStory.id}
                    ariaLabel={t.story.repo.bookFilterLabel}
                    allBooksLabel={t.story.repo.allBooksOption}
                  />
                  <ListChecks className="w-5 h-5 text-forest" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-forestDark">
                      {t.story.level3.skeletonHeader}: {displayTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-[#F7ECD8]/70 p-1 border border-line">
                    <button
                      type="button"
                      aria-pressed={level3Scope === "all"}
                      onClick={() => setLevel3Scope("all")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        level3Scope === "all"
                          ? "bg-forest text-white shadow-sm"
                          : "text-forestDark hover:bg-white/60"
                      }`}
                    >
                      {t.story.level3.filterAllScenes} ({visibleScenes.length})
                    </button>
                    <button
                      type="button"
                      aria-pressed={level3Scope === "current"}
                      onClick={() => setLevel3Scope("current")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        level3Scope === "current"
                          ? "bg-forest text-white shadow-sm"
                          : "text-forestDark hover:bg-white/60"
                      }`}
                    >
                      {t.story.level3.filterCurrentScene}
                    </button>
                  </div>

                  {level3Scope === "current" && (
                    <ChapterNavControls
                      activeIndex={safeSceneIndex}
                      total={totalScenes}
                      scenes={visibleScenes}
                      onPrev={handlePrevScene}
                      onNext={handleNextScene}
                      onSelect={goToScene}
                      sceneLabel={t.story.nav.sceneLabel}
                      prevLabel={t.story.nav.prevScene}
                      nextLabel={t.story.nav.nextScene}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {(level3Scope === "current" && currentScene
                  ? [{ sc: currentScene, idx: safeSceneIndex }]
                  : visibleScenes.map((sc, idx) => ({ sc, idx }))
                ).map(({ sc, idx }) => {
                  const isFocused = idx === safeSceneIndex;
                  return (
                    <div
                      key={sc.id}
                      onClick={level3Scope === "all" ? () => goToScene(idx) : undefined}
                      className={`p-4 rounded-xl border transition-all ${
                        level3Scope === "all" ? "cursor-pointer " : ""
                      }${
                        isFocused
                          ? "bg-[#E3EFE0]/50 border-forest shadow-sm"
                          : "bg-[#FFFDF8] border-line hover:border-forest/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div>
                          {sc.section && (
                            <div className="text-[11px] font-semibold text-terra uppercase tracking-wide">
                              {formatSceneSection(
                                books.find((b) => b.id === sc.bookId)?.title,
                                sc.section
                              )}
                            </div>
                          )}
                          <h4 className="font-serif font-bold text-base text-forestDark">
                            {sc.title}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge-sand text-[11px]">
                            {sc.summaryPoints.length} {t.story.level3.pointsBadge}
                          </span>
                          {isFocused && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToScene(idx);
                                handleJumpToIllustration(sc.illustrationId);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forestDark transition"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{t.story.level3.openInLevel4Btn}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-1.5 text-sm text-ink">
                        {sc.summaryPoints.map((pt, ptIdx) => (
                          <li key={ptIdx} className="flex items-start gap-2">
                            <span className="text-terra font-bold leading-snug">•</span>
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <LevelStepFooter
                activeLevel={activeLevel}
                onSelectLevel={handleSelectLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 4: 28 TRANH GỢI NHỚ THUẦN HÌNH ẢNH (KHÔNG CHỮ GỢI Ý)    */}
          {/* ============================================================== */}
          {activeLevel === 4 && currentIllustration && (
            <div
              ref={readingSurfaceRef}
              className="reading-surface space-y-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Thanh công cụ tối giản — tuyệt đối không hiển thị tiêu đề hay chữ gợi ý cốt truyện */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <BookSelectDropdown
                    books={books}
                    totalChapters={allScenes.length}
                    selectedBookId={selectedBookId}
                    onSelect={handleBookSelect}
                    lang={lang}
                    storyId={selectedStory.id}
                    ariaLabel={t.story.repo.bookFilterLabel}
                    allBooksLabel={t.story.repo.allBooksOption}
                  />
                  <IllustrationNavControls
                    activeIndex={safeIllustrationIndex}
                    total={totalIllustrations}
                    illustrations={visibleIllustrations}
                    onPrev={handlePrevIllustration}
                    onNext={handleNextIllustration}
                    onSelect={setActiveIllustrationIndex}
                    illustrationLabel={t.story.level4.illustrationLabel}
                    prevLabel={t.story.level4.prevIllustration}
                    nextLabel={t.story.level4.nextIllustration}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!shouldShowRepoImg &&
                    !currentIllustration.imagePath &&
                    selectedStory?.id !== EARTH_STORY_ID && (
                    <span className="badge-sand text-[11px]">
                      {t.story.level4.artModeProceduralBadge}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-pressed={isLevel4StageMode}
                    onClick={() => setIsLevel4StageMode((v) => !v)}
                    className={`btn-ghost text-xs py-1.5 px-2.5 ${
                      isLevel4StageMode ? "bg-[#E3EFE0] border-forest" : ""
                    }`}
                    title={
                      isLevel4StageMode
                        ? t.story.level4.stageModeExit
                        : t.story.level4.stageModeEnter
                    }
                  >
                    {isLevel4StageMode ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden md:inline">
                      {isLevel4StageMode
                        ? t.story.level4.stageModeExit
                        : t.story.level4.stageModeEnter}
                    </span>
                  </button>
                </div>
              </div>

              {/* Khung tranh thuần hình ảnh — tuyệt đối không chữ gợi ý */}
              <div
                onClick={handleIllustrationCanvasClick}
                className={`relative w-full mx-auto aspect-[16/10] rounded-2xl overflow-hidden border-2 border-line bg-[#FAF6EC] shadow-md group transition-all cursor-pointer ${
                  isLevel4StageMode ? "max-w-5xl" : "max-w-3xl"
                }`}
              >
                {level4ImgSrc ? (
                  <img
                    src={level4ImgSrc}
                    alt=""
                    aria-label={`${t.story.level4.illustrationLabel} ${currentIllustration.ord}`}
                    onError={() => {
                      if (repoImgUrl && !failedRepoImages[repoImgUrl]) {
                        setFailedRepoImages((prev) => ({ ...prev, [repoImgUrl]: true }));
                      }
                    }}
                    className={`w-full h-full select-none ${
                      shouldShowRepoImg || currentIllustration.imagePath
                        ? "object-contain"
                        : "object-cover"
                    }`}
                  />
                ) : (
                  <div
                    aria-label={`${t.story.level4.illustrationLabel} ${currentIllustration.ord}`}
                    className="absolute inset-0"
                  />
                )}

                {safeIllustrationIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevIllustration}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-forestDark shadow-md transition backdrop-blur-sm opacity-75 group-hover:opacity-100"
                    aria-label={t.story.level4.prevIllustration}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {safeIllustrationIndex < totalIllustrations - 1 && (
                  <button
                    type="button"
                    onClick={handleNextIllustration}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-forestDark shadow-md transition backdrop-blur-sm opacity-75 group-hover:opacity-100"
                    aria-label={t.story.level4.nextIllustration}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              <LevelStepFooter
                activeLevel={activeLevel}
                onSelectLevel={handleSelectLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}
        </section>
      )}

      {/* ================================================================== */}
      {/* NÚT & BẢNG THU ÂM GÓC PHẢI DƯỚI (THU NHỎ KHI ĐỌC, MỞ KHI CẦN)     */}
      {/* ================================================================== */}
      {selectedStory && (
        <aside
          ref={recorderDockRef}
          aria-label="Thanh thu âm và nghe lại giọng kể"
          className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2"
        >
          {!isRecorderExpanded ? (
            <button
              type="button"
              onClick={() => setIsRecorderExpanded(true)}
              aria-expanded={false}
              aria-label={t.story.recorder.expandBtnLabel}
              title={t.story.recorder.expandBtnLabel}
              className={`relative flex items-center justify-center rounded-full shadow-xl border-2 transition active:scale-95 ${
                isRecording
                  ? "h-12 px-3.5 gap-2 bg-red-700 hover:bg-red-800 text-white border-red-200 motion-safe:animate-pulse"
                  : isPaused
                  ? "h-12 px-3.5 gap-2 bg-amber-700 hover:bg-amber-800 text-white border-amber-200"
                  : "w-12 h-12 bg-terra hover:bg-[#a84736] text-white border-[#FFFDF7]/90"
              }`}
            >
              {isPaused ? (
                <Pause className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Mic className="w-5 h-5" aria-hidden="true" />
              )}
              {isRecorderActive && (
                <span className="font-mono tabular-nums text-xs font-semibold">
                  {formatDuration(recordingSeconds)}
                </span>
              )}
              {!isRecorderActive && recordings.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center border border-[#FFFDF7] shadow">
                  {recordings.length}
                </span>
              )}
            </button>
          ) : (
            <div className="w-[calc(100vw-2rem)] sm:w-96 max-w-md space-y-2">
              {showTakesPanel && recordings.length > 0 && (
                <div className="bg-[#FFFDF7]/98 backdrop-blur-md border border-line rounded-2xl shadow-xl p-3 max-h-60 overflow-y-auto space-y-2">
                  {recordings.map((rec) => {
                  const isCurrentTake =
                    rec.storyId === selectedStory.id &&
                    (rec.ancientBookId
                      ? activeAncientBook?.id === rec.ancientBookId
                      : ((rec.level === 4 &&
                          activeLevel === 4 &&
                          currentIllustration &&
                          rec.sceneOrd === currentIllustration.ord) ||
                        (rec.level !== 4 &&
                          activeLevel !== 4 &&
                          currentScene &&
                          rec.sceneOrd === currentScene.ord)));
                    return (
                      <div
                        key={rec.id}
                        className={`flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border ${
                          activeRecording?.id === rec.id
                            ? "bg-[#E3EFE0]/60 border-forest/40"
                            : "bg-white border-line"
                        }`}
                      >
                        <div className="text-xs font-medium text-forestDark min-w-[130px]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold">{rec.label}</span>
                            {isCurrentTake && (
                              <span className="badge-leaf text-[10px] py-0 px-1.5">
                                {t.story.recorder.currentSceneBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-inkSoft">
                            {formatDuration(rec.durationSeconds)} · {rec.createdAt}
                          </div>
                        </div>

                        <audio controls src={rec.audioUrl} className="h-8 flex-1 min-w-[160px]" />

                        <div className="flex items-center gap-1">
                          <a
                            href={rec.audioUrl}
                            download={
                              rec.ancientBookId
                                ? `co-thu-${rec.ancientBookId}.${getAudioFileExtension(rec.mimeType)}`
                                : `ke-chuyen-L${rec.level}-${rec.sceneOrd}.${getAudioFileExtension(rec.mimeType)}`
                            }
                            className="p-1.5 rounded-lg border border-line text-forest hover:bg-[#F7ECD8] transition"
                            title={t.story.recorder.downloadTake}
                            aria-label={t.story.recorder.downloadTake}
                          >
                            <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecording(rec.id)}
                            className="p-1.5 rounded-lg border border-line text-terra hover:bg-[#F7DDD6]/50 transition"
                            title={t.story.recorder.deleteTake}
                            aria-label={t.story.recorder.deleteTake}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {micError && (
                <div
                  role="alert"
                  className="px-3 py-2 rounded-xl bg-[#FDF2F0] border border-terra/40 text-xs text-terra font-medium text-center shadow"
                >
                  {micError}
                </div>
              )}

              <div className="bg-[#FFFDF7]/95 backdrop-blur-md border-2 border-forest/30 shadow-2xl rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {activeAncientBook ? (
                      <span className="badge-leaf font-bold text-xs max-w-[220px] truncate">
                        {t.story.recorder.ancientTextPrefix} · {activeAncientBook.title}
                      </span>
                    ) : (
                      <span className="badge-leaf font-bold text-xs">Level {activeLevel}</span>
                    )}
                    {!activeAncientBook && activeLevel === 4 ? (
                      totalIllustrations > 0 && (
                        <span className="text-xs font-serif font-bold text-forestDark whitespace-nowrap">
                          {currentIllustration?.ord || safeIllustrationIndex + 1}/
                          {allIllustrations.length}
                        </span>
                      )
                    ) : !activeAncientBook ? (
                      totalScenes > 0 && (
                        <span className="text-xs font-serif font-bold text-forestDark whitespace-nowrap">
                          {currentScene?.ord || safeSceneIndex + 1}/{allScenes.length}
                        </span>
                      )
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowTakesPanel(false);
                      setIsRecorderExpanded(false);
                    }}
                    aria-label={t.story.recorder.collapseBtnLabel}
                    title={t.story.recorder.collapseBtnLabel}
                    className="btn-ghost text-xs py-1 px-2"
                  >
                    <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.story.recorder.collapseBtnLabel}</span>
                  </button>
                </div>

                {isRecorderActive && (
                  <div
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
                      isRecording
                        ? "bg-red-50 border-red-200 text-red-900"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <span
                      role="status"
                      aria-live="polite"
                      className="inline-flex items-center gap-1.5 font-semibold"
                    >
                      {isRecording ? (
                        <span
                          aria-hidden="true"
                          className="w-2 h-2 rounded-full bg-red-600 motion-safe:animate-pulse"
                        />
                      ) : (
                        <Pause className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                      )}
                      <span>
                        {isRecording
                          ? t.story.recorder.recordingStatus
                          : t.story.recorder.pausedStatus}
                      </span>
                    </span>
                    <span className="font-mono tabular-nums font-bold">
                      {formatDuration(recordingSeconds)}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {!isRecorderActive ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-4 py-2 rounded-xl bg-terra hover:bg-[#a84736] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95"
                    >
                      <Mic className="w-4 h-4" aria-hidden="true" />
                      <span>{t.story.recorder.recordBtn}</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {isRecording ? (
                        <button
                          type="button"
                          onClick={pauseRecording}
                          className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95"
                        >
                          <Pause className="w-4 h-4" aria-hidden="true" />
                          <span>{t.story.recorder.pauseBtn}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resumeRecording}
                          className="px-3.5 py-2 rounded-xl bg-forest hover:bg-[#254a2e] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-white" aria-hidden="true" />
                          <span>{t.story.recorder.resumeBtn}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
                        <span>{t.story.recorder.stopBtn}</span>
                      </button>
                    </div>
                  )}

                  {recordings.length > 0 && (
                    <button
                      type="button"
                      aria-expanded={showTakesPanel}
                      onClick={() => setShowTakesPanel((v) => !v)}
                      className="btn-ghost text-xs py-1.5 px-2.5"
                      title={t.story.recorder.showTakesBtn}
                    >
                      <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{recordings.length}</span>
                    </button>
                  )}
                </div>

                {activeRecording && !isRecorderActive ? (
                  <audio controls src={activeRecording.audioUrl} className="h-8 w-full" />
                ) : (
                  !isRecorderActive && (
                    <p className="text-[11px] text-inkSoft leading-snug">
                      {t.story.recorder.noRecordingYet}
                    </p>
                  )
                )}
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

export default function Page() {
  return <StorytellingPracticePage />;
}

function LevelStepFooter({
  activeLevel,
  onSelectLevel,
  prevPrefix,
  nextPrefix,
}: {
  activeLevel: PracticeLevel;
  onSelectLevel: (level: PracticeLevel) => void;
  prevPrefix: string;
  nextPrefix: string;
}) {
  const prevLevel = activeLevel > 1 ? ((activeLevel - 1) as PracticeLevel) : null;
  const nextLevel = activeLevel < 4 ? ((activeLevel + 1) as PracticeLevel) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-line/70">
      {prevLevel !== null ? (
        <button
          type="button"
          onClick={() => onSelectLevel(prevLevel)}
          className="btn-ghost text-xs py-1.5 px-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>
            {prevPrefix} {prevLevel}
          </span>
        </button>
      ) : (
        <span />
      )}

      {nextLevel !== null && (
        <button
          type="button"
          onClick={() => onSelectLevel(nextLevel)}
          className="btn-primary text-xs py-1.5 px-3.5"
        >
          <span>
            {nextPrefix} {nextLevel}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/** Bộ chọn Quyển thu gọn dùng chung trên thanh điều hướng của các Level. */
function BookSelectDropdown({
  books,
  totalChapters,
  selectedBookId,
  onSelect,
  lang,
  storyId,
  ariaLabel,
  allBooksLabel,
}: {
  books: StoryBookMeta[];
  totalChapters: number;
  selectedBookId: string;
  onSelect: (bookId: string) => void;
  lang: string;
  storyId: string;
  ariaLabel: string;
  allBooksLabel: string;
}) {
  if (books.length === 0) return null;

  const formatBookLabel = (bk: StoryBookMeta): string => {
    if (storyId === EARTH_STORY_ID) {
      if (lang === "en") return `Act ${bk.number} (${bk.totalChapters})`;
      if (lang === "zh") return `第${bk.number}幕 (${bk.totalChapters})`;
      return `Hồi ${bk.number} (${bk.totalChapters})`;
    }
    if (bk.isEpilogue) {
      if (lang === "en") return `Book V · Epilogue (${bk.totalChapters})`;
      if (lang === "zh") return `第五卷 · 外传 (${bk.totalChapters})`;
      return `Quyển V · Ngoại truyện (${bk.totalChapters})`;
    }
    if (lang === "en") return `Book ${bk.number} (${bk.totalChapters})`;
    if (lang === "zh") return `第${bk.number}卷 (${bk.totalChapters})`;
    return `Quyển ${bk.number} (${bk.totalChapters})`;
  };

  return (
    <select
      aria-label={ariaLabel}
      value={selectedBookId}
      onChange={(e) => onSelect(e.target.value)}
      className="px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs font-semibold text-forestDark max-w-[155px] sm:max-w-[195px] truncate"
    >
      <option value="all">
        {allBooksLabel} ({totalChapters})
      </option>
      {books.map((bk) => (
        <option key={bk.id} value={bk.id} title={bk.title}>
          {formatBookLabel(bk)}
        </option>
      ))}
    </select>
  );
}

function ChapterNavControls({
  activeIndex,
  total,
  scenes,
  onPrev,
  onNext,
  onSelect,
  sceneLabel,
  prevLabel,
  nextLabel,
}: {
  activeIndex: number;
  total: number;
  scenes: StoryScene[];
  onPrev: () => void;
  onNext: () => void;
  onSelect: (idx: number) => void;
  sceneLabel: string;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={activeIndex <= 0}
        className="btn-ghost text-xs py-1 px-2.5 disabled:opacity-30 disabled:pointer-events-none"
        aria-label={prevLabel}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {total <= 10 ? (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`transition-all rounded-full ${
                idx === activeIndex
                  ? "w-6 h-2.5 bg-forest"
                  : "w-2.5 h-2.5 bg-[#D5C7B0] hover:bg-forest/60"
              }`}
              aria-label={`${sceneLabel} ${scenes[idx]?.chapterNumber || idx + 1}`}
            />
          ))}
        </div>
      ) : (
        <select
          value={activeIndex}
          onChange={(e) => onSelect(Number(e.target.value))}
          aria-label={sceneLabel}
          className="px-2 py-1 rounded-lg border border-line bg-white text-xs font-medium text-forestDark max-w-[200px]"
        >
          {scenes.map((sc, idx) => (
            <option key={sc.id} value={idx}>
              Q{sc.bookId.replace("quyen-", "")} · {sc.title}
            </option>
          ))}
        </select>
      )}

      <span className="text-xs font-serif font-bold text-forestDark whitespace-nowrap ml-1">
        {activeIndex + 1} / {total}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex >= total - 1}
        className="btn-ghost text-xs py-1 px-2.5 disabled:opacity-30 disabled:pointer-events-none"
        aria-label={nextLabel}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function IllustrationNavControls({
  activeIndex,
  total,
  illustrations,
  onPrev,
  onNext,
  onSelect,
  illustrationLabel,
  prevLabel,
  nextLabel,
}: {
  activeIndex: number;
  total: number;
  illustrations: StoryIllustration[];
  onPrev: () => void;
  onNext: () => void;
  onSelect: (idx: number) => void;
  illustrationLabel: string;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={activeIndex <= 0}
        className="btn-ghost text-xs py-1 px-2.5 disabled:opacity-30 disabled:pointer-events-none"
        aria-label={prevLabel}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {total <= 8 ? (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`transition-all rounded-full ${
                idx === activeIndex
                  ? "w-6 h-2.5 bg-forest"
                  : "w-2.5 h-2.5 bg-[#D5C7B0] hover:bg-forest/60"
              }`}
              aria-label={`${illustrationLabel} ${illustrations[idx]?.ord || idx + 1}`}
            />
          ))}
        </div>
      ) : (
        <select
          value={activeIndex}
          onChange={(e) => onSelect(Number(e.target.value))}
          aria-label={illustrationLabel}
          className="px-2 py-1 rounded-lg border border-line bg-white text-xs font-medium text-forestDark max-w-[140px]"
        >
          {illustrations.map((il, idx) => (
            <option key={il.id} value={idx}>
              {illustrationLabel} {il.ord}
            </option>
          ))}
        </select>
      )}

      <span className="text-xs font-serif font-bold text-forestDark whitespace-nowrap ml-1">
        {activeIndex + 1} / {total}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex >= total - 1}
        className="btn-ghost text-xs py-1 px-2.5 disabled:opacity-30 disabled:pointer-events-none"
        aria-label={nextLabel}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface LevelMenuEntry {
  badge: string;
  shortTitle: string;
}

/** Dropdown chọn 1 trong 4 mức luyện tập (Level 1–4) gọn gàng cạnh hai nút mở rộng. */
function LevelSelectDropdown({
  activeLevel,
  levels,
  isOpen,
  onToggle,
  onSelect,
  menuRef,
  label,
}: {
  activeLevel: PracticeLevel;
  levels: Record<PracticeLevel, LevelMenuEntry>;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (level: PracticeLevel) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  label: string;
}) {
  const current = levels[activeLevel];

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`${label}: ${activeLevel}. ${current.shortTitle}`}
        className={`btn-ghost text-xs py-2 px-3 ${
          isOpen ? "bg-[#E3EFE0] border-forest" : ""
        }`}
      >
        <BookOpen className="w-3.5 h-3.5 text-forest" />
        <span>
          {activeLevel}. {current.shortTitle}
        </span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={label}
          className="absolute left-0 top-full mt-1.5 z-30 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-[#FFFDF7] p-1.5 shadow-lg space-y-0.5"
        >
          {PRACTICE_LEVELS.map((lvl) => {
            const meta = levels[lvl];
            const isSelected = activeLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => onSelect(lvl)}
                className={`w-full text-left flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition ${
                  isSelected
                    ? "bg-[#E3EFE0] text-forestDark font-semibold"
                    : "text-ink hover:bg-[#F7ECD8]/70 font-medium"
                }`}
              >
                <span>
                  {lvl}. {meta.shortTitle}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PdfMenuCopy {
  downloadBtn: string;
  downloadingBtn: string;
  withImagesOption: string;
  withImagesDesc: string;
  withoutImagesOption: string;
  withoutImagesDesc: string;
}

/** Nút chọn xuất PDF toàn văn với 2 chế độ: kèm ảnh Level 4 hoặc không kèm ảnh (thuần chữ). */
function PdfExportDropdown({
  isOpen,
  isExporting,
  onToggle,
  onSelect,
  menuRef,
  copy,
}: {
  isOpen: boolean;
  isExporting: boolean;
  onToggle: () => void;
  onSelect: (includeImages: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  copy: PdfMenuCopy;
}) {
  const [alignRight, setAlignRight] = useState(true);

  const handleTriggerClick = () => {
    if (!isOpen && menuRef.current && typeof window !== "undefined") {
      const rect = menuRef.current.getBoundingClientRect();
      const menuWidth = 288;
      const fitsRight = rect.left + menuWidth <= window.innerWidth - 16;
      const fitsLeft = rect.right - menuWidth >= 16;
      setAlignRight(!fitsRight && fitsLeft);
    }
    onToggle();
  };

  const options = [
    {
      includeImages: true,
      label: copy.withImagesOption,
      desc: copy.withImagesDesc,
      Icon: ImageIcon,
    },
    {
      includeImages: false,
      label: copy.withoutImagesOption,
      desc: copy.withoutImagesDesc,
      Icon: ScrollText,
    },
  ];

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={isExporting}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={copy.downloadBtn}
        className="btn-terra text-xs py-2 px-3"
      >
        <FileDown
          className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`}
        />
        <span>{isExporting ? copy.downloadingBtn : copy.downloadBtn}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !isExporting && (
        <div
          role="menu"
          aria-label={copy.downloadBtn}
          className={`absolute top-full mt-1.5 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-[#FFFDF7] p-1.5 shadow-lg ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          {options.map(({ includeImages, label, desc, Icon }) => (
            <button
              key={includeImages ? "with-images" : "without-images"}
              type="button"
              role="menuitem"
              onClick={() => onSelect(includeImages)}
              className="w-full text-left flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition hover:bg-[#F7ECD8]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            >
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FDF0E6] text-terra border border-terra/20">
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-forestDark">
                  {label}
                </span>
                <span className="block text-[11px] leading-snug text-inkSoft mt-0.5">
                  {desc}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
