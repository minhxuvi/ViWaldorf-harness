"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import {
  AgeVariantId,
  AncientBookItem,
  PracticeLevel,
  WaldorfArtStyle,
  VoiceRecording,
  StoryScene,
} from "@/lib/types";
import { segmentStoryLocally } from "@/lib/seedData";
import { ProceduralIllustrator } from "@/lib/art/proceduralIllustrator";
import {
  buildGitHubBlobUrl,
  buildRepoFileUrl,
  cleanInlineMarkdown,
  fetchAncientBookMarkdown,
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_REPO_URL,
  getCandidateRepoBaseUrls,
} from "@/lib/repoStoryLoader";
import {
  BookOpen,
  Mic,
  Square,
  Upload,
  PlusCircle,
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
} from "lucide-react";

const PRACTICE_LEVELS: PracticeLevel[] = [0, 1, 2, 3, 4];
const AGE_VARIANTS: AgeVariantId[] = ["3-5", "6-10", "11+"];
const ANCIENT_CATEGORIES = ["all", "cuu-uoc", "tan-uoc", "co-thu"] as const;
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
    return new Date(ts).toLocaleString(lang === "en" ? "en-US" : "vi-VN", {
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

function getActiveRepoPath(params: {
  level: PracticeLevel;
  ageVariant: AgeVariantId;
  scene?: StoryScene;
  overviewPath?: string;
}): string {
  const { level, ageVariant, scene, overviewPath } = params;
  const lp = scene?.levelPaths;
  if (!lp) return overviewPath || "";

  switch (level) {
    case 0:
      return lp.level0Book || lp.level0Overview || overviewPath || "";
    case 1:
      return lp.level1[ageVariant] || lp.level1["6-10"] || "";
    case 2:
      return lp.level2[ageVariant] || lp.level2["6-10"] || "";
    case 3:
      return lp.level3 || "";
    case 4:
      return lp.level4Image || scene?.repoImage || "";
  }
}

export default function StorytellingPracticePage() {
  const {
    data,
    updateData,
    selectedStory,
    setSelectedStoryId,
    t,
    lang,
    isSyncingRepo,
    syncError,
    syncNotice,
    syncFromRepo,
  } = useApp();

  // Trạng thái luyện tập 5 cấp độ (Level 0 -> Level 4)
  const [activeLevel, setActiveLevel] = useState<PracticeLevel>(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [level1FlowMode, setLevel1FlowMode] = useState<"scene" | "full">("scene");
  const [level1TextSize, setLevel1TextSize] = useState<Level1TextSize>("md");
  const [level3Scope, setLevel3Scope] = useState<"all" | "current">("all");
  const [isLevel4StageMode, setIsLevel4StageMode] = useState<boolean>(false);
  const [selectedBookId, setSelectedBookId] = useState<string>("all");
  const [selectedAgeVariant, setSelectedAgeVariant] = useState<AgeVariantId>("6-10");

  // Level 0: Tổng quan sử thi & Văn bản cổ đọc thêm tải qua CDN theo nhu cầu
  const [showEpicOverview, setShowEpicOverview] = useState<boolean>(false);
  const [ancientCategory, setAncientCategory] = useState<AncientCategoryFilter>("all");
  const [activeAncientBook, setActiveAncientBook] = useState<AncientBookItem | null>(null);
  const [ancientBookContent, setAncientBookContent] = useState<string>("");
  const [ancientBookLoading, setAncientBookLoading] = useState<boolean>(false);
  const [ancientBookError, setAncientBookError] = useState<string>("");
  const ancientCacheRef = useRef<Record<string, string>>({});

  // Level 4: theo dõi URL ảnh từ repo bị lỗi (404 khi tranh chưa được tạo) & chế độ SVG dự phòng
  const [failedRepoImages, setFailedRepoImages] = useState<Record<string, boolean>>({});
  const [preferProceduralArt, setPreferProceduralArt] = useState<boolean>(false);

  // Vuốt ngang trên thiết bị cảm ứng cho phân cảnh
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Form thêm truyện mới cục bộ
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAge, setNewAge] = useState("6–9 tuổi");
  const [newStyle, setNewStyle] = useState<WaldorfArtStyle>("wet-on-wet");
  const [newCulturalSpirit, setNewCulturalSpirit] = useState("");
  const [newRhythm, setNewRhythm] = useState("");
  const [newMetaphor, setNewMetaphor] = useState("");
  const [newText, setNewText] = useState("");

  // Thu âm & Nghe lại thuần túy (MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [showTakesPanel, setShowTakesPanel] = useState(false);
  const [micError, setMicError] = useState<string>("");

  const storyFileInputRef = useRef<HTMLInputElement | null>(null);
  const customImageInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartMsRef = useRef<number>(0);
  const recordingsRef = useRef<VoiceRecording[]>([]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  // Dọn dẹp timer và Blob URL khi thoát trang
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingsRef.current.forEach((rec) => {
        try {
          URL.revokeObjectURL(rec.audioUrl);
        } catch {}
      });
    };
  }, []);

  // Đặt lại bộ lọc và phân cảnh về 0 khi đổi truyện
  useEffect(() => {
    setActiveSceneIndex(0);
    setSelectedBookId("all");
    setShowEpicOverview(false);
    setAncientCategory("all");
    setActiveAncientBook(null);
    setAncientBookContent("");
    setAncientBookError("");
  }, [selectedStory?.id]);

  // Làm mới bộ nhớ đệm ảnh lỗi khi vừa đồng bộ xong từ repo
  useEffect(() => {
    setFailedRepoImages({});
    ancientCacheRef.current = {};
  }, [selectedStory?.lastSyncedAt]);

  const allScenes: StoryScene[] = useMemo(() => selectedStory?.scenes || [], [selectedStory]);
  const books = selectedStory?.books || [];

  const visibleScenes: StoryScene[] = useMemo(() => {
    if (!books.length || selectedBookId === "all") return allScenes;
    const filtered = allScenes.filter((sc) => sc.bookId === selectedBookId);
    return filtered.length > 0 ? filtered : allScenes;
  }, [allScenes, books.length, selectedBookId]);

  const totalScenes = visibleScenes.length;
  const safeSceneIndex = Math.min(activeSceneIndex, Math.max(0, totalScenes - 1));
  const currentScene: StoryScene | undefined = visibleScenes[safeSceneIndex] || visibleScenes[0];

  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
    setActiveSceneIndex(0);
  };

  const handlePrevScene = () => {
    setActiveSceneIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextScene = () => {
    setActiveSceneIndex((prev) => Math.min(Math.max(0, totalScenes - 1), prev + 1));
  };

  // Điều hướng bàn phím ← / →
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") {
        setActiveSceneIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveSceneIndex((prev) => Math.min(Math.max(0, totalScenes - 1), prev + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [totalScenes]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const delta = touchStartX - touchEndX;
    if (delta > 45) handleNextScene();
    else if (delta < -45) handlePrevScene();
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleSyncRepoClick = async () => {
    setFailedRepoImages({});
    ancientCacheRef.current = {};
    await syncFromRepo({ force: true });
  };

  const handleOpenAncientBook = async (book: AncientBookItem) => {
    if (activeAncientBook?.id === book.id) {
      setActiveAncientBook(null);
      return;
    }
    setActiveAncientBook(book);
    setAncientBookError("");

    const cached = ancientCacheRef.current[book.file];
    if (cached) {
      setAncientBookContent(cached);
      return;
    }

    setAncientBookLoading(true);
    setAncientBookContent("");
    try {
      const md = await fetchAncientBookMarkdown(
        book.file,
        selectedStory?.rawBaseUrl || GENESIS_JSDELIVR_BASE_URL
      );
      ancientCacheRef.current[book.file] = md;
      setAncientBookContent(md);
    } catch (err) {
      setAncientBookError(
        err instanceof Error ? err.message : "Không thể tải văn bản cổ từ repo."
      );
    } finally {
      setAncientBookLoading(false);
    }
  };

  // Tải file truyện .txt / .md
  const handleStoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = typeof ev.target?.result === "string" ? ev.target.result : "";
      if (text.trim()) {
        setNewText(text);
        setNewTitle(file.name.replace(/\.(txt|md)$/i, ""));
        setShowAddForm(true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Lưu truyện mới (tách phân cảnh hoàn toàn cục bộ)
  const handleSaveNewStory = () => {
    if (!newText.trim()) return;
    const created = segmentStoryLocally({
      title: newTitle,
      ageRange: newAge,
      artStyle: newStyle,
      rawText: newText,
      culturalSpirit: newCulturalSpirit,
      storytellingRhythm: newRhythm,
      ageMetaphor: newMetaphor,
    });

    updateData((prev) => ({
      ...prev,
      stories: [created, ...prev.stories],
    }));

    setSelectedStoryId(created.id);
    setActiveLevel(0);
    setActiveSceneIndex(0);
    setShowAddForm(false);
    setNewTitle("");
    setNewCulturalSpirit("");
    setNewRhythm("");
    setNewMetaphor("");
    setNewText("");
  };

  // Đổi chất liệu tranh dự phòng cho phân cảnh hiện tại (Level 4)
  const handleSceneArtStyleChange = (style: WaldorfArtStyle) => {
    if (!selectedStory || !currentScene) return;
    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((story) => {
        if (story.id !== selectedStory.id) return story;
        return {
          ...story,
          scenes: story.scenes.map((sc) =>
            sc.id === currentScene.id ? { ...sc, artStyle: style } : sc
          ),
        };
      }),
    }));
  };

  // Tải tranh vẽ tay tùy chọn từ máy cho phân cảnh hiện tại (Level 4)
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStory || !currentScene) return;
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
            scenes: story.scenes.map((sc) =>
              sc.id === currentScene.id ? { ...sc, imagePath: dataUrl } : sc
            ),
          };
        }),
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleResetSceneImage = () => {
    if (!selectedStory || !currentScene) return;
    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((story) => {
        if (story.id !== selectedStory.id) return story;
        return {
          ...story,
          scenes: story.scenes.map((sc) =>
            sc.id === currentScene.id ? { ...sc, imagePath: null } : sc
          ),
        };
      }),
    }));
  };

  // Bắt đầu thu âm (chỉ thu âm và cho nghe lại, không phân tích/đánh giá AI)
  const startRecording = async () => {
    setMicError("");
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMicError(t.story.recorder.unsupportedNotice);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      recordingStartMsRef.current = Date.now();
      setIsRecording(true);
      setRecordingSeconds(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(Math.floor((Date.now() - recordingStartMsRef.current) / 1000));
      }, 500);

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      const capturedLevel = activeLevel;
      const capturedSceneOrd = currentScene?.ord || safeSceneIndex + 1;
      const capturedStoryId = selectedStory?.id || "story";

      recorder.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());

        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - recordingStartMsRef.current) / 1000)
        );
        const blobType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: blobType });
        const audioUrl = URL.createObjectURL(blob);

        const recId = `rec-${Date.now()}`;
        const label = `Level ${capturedLevel} · ${t.story.nav.sceneLabel} ${capturedSceneOrd}`;
        const newRec: VoiceRecording = {
          id: recId,
          storyId: capturedStoryId,
          level: capturedLevel,
          sceneOrd: capturedSceneOrd,
          label,
          audioUrl,
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
      setIsRecording(false);
      setMicError(t.story.recorder.micDeniedNotice);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
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

  const currentLevelMeta = t.story.levels[activeLevel];

  // Xác định Level 0 Soul theo Quyển đang chọn
  const activeBookIdForSoul =
    selectedBookId !== "all" ? selectedBookId : currentScene?.bookId || "quyen-1";
  const activeSoul =
    selectedStory?.soul.bookSouls?.[activeBookIdForSoul] || selectedStory?.soul;
  const activeMetaphor =
    activeSoul?.ageMetaphors?.[selectedAgeVariant] || activeSoul?.ageMetaphor || "";

  // Xác định nội dung Level 1 & Level 2 theo biến thể lứa tuổi
  const getSceneVariant = (sc: StoryScene) => sc.variants?.[selectedAgeVariant];
  const currentPassage =
    (currentScene && getSceneVariant(currentScene)?.passage) || currentScene?.passage || "";
  const currentVoiceNote =
    (currentScene && getSceneVariant(currentScene)?.voiceNote) || currentScene?.voiceNote || "";
  const currentOutline =
    (currentScene && getSceneVariant(currentScene)?.detailedOutline) ||
    currentScene?.detailedOutline;

  // Xác định đường dẫn ảnh Level 4 qua CDN (chỉ tải khi story-index xác nhận imageGenerated = true)
  const repoImageCandidates = useMemo(() => {
    if (
      !currentScene?.imageGenerated ||
      !currentScene?.repoImage ||
      preferProceduralArt ||
      currentScene?.imagePath
    ) {
      return [];
    }
    return getCandidateRepoBaseUrls(selectedStory?.rawBaseUrl).map((base) =>
      buildRepoFileUrl(currentScene.repoImage!, base)
    );
  }, [currentScene, preferProceduralArt, selectedStory?.rawBaseUrl]);

  const repoImgUrl = repoImageCandidates.find((u) => !failedRepoImages[u]) || "";
  const shouldShowRepoImg = Boolean(!currentScene?.imagePath && repoImgUrl);
  const level4ImgSrc = currentScene
    ? currentScene.imagePath
      ? currentScene.imagePath
      : shouldShowRepoImg
      ? repoImgUrl
      : ProceduralIllustrator.generateArtSVG(currentScene, currentScene.artStyle)
    : "";

  // Đường dẫn folder/file đang xem trên GitHub repo
  const activeRepoPath = getActiveRepoPath({
    level: activeLevel,
    ageVariant: selectedAgeVariant,
    scene: currentScene,
    overviewPath: selectedStory?.soul.overviewPath,
  });

  const ancientBooks = selectedStory?.soul.ancientBooks || [];
  const filteredAncientBooks = useMemo(() => {
    if (ancientCategory === "all") return ancientBooks;
    return ancientBooks.filter((ab) => ab.category === ancientCategory);
  }, [ancientBooks, ancientCategory]);
  const lastSyncedText = formatLastSynced(selectedStory?.lastSyncedAt, lang);

  return (
    <div className="space-y-6 pb-32">
      <PageHeader title={t.story.pageTitle} subtitle={t.story.pageSubtitle} />

      {/* Thanh chọn truyện, kết nối CDN an toàn & tải lên */}
      <section className="garden-card space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <label
              htmlFor="story-selector"
              className="text-sm font-semibold text-forestDark flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-forest" />
              <span>{t.story.selectStory}:</span>
            </label>
            <select
              id="story-selector"
              value={selectedStory?.id || ""}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-line bg-white text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest/40 max-w-full"
            >
              {data.stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {lang === "en" && story.titleEn ? story.titleEn : story.title} (
                  {story.scenes.length} {t.story.scenesCountSuffix})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedStory?.repoUrl && (
              <button
                type="button"
                onClick={handleSyncRepoClick}
                disabled={isSyncingRepo}
                className="btn-ghost text-xs py-2 px-3 border-forest/30"
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

            <input
              type="file"
              ref={storyFileInputRef}
              accept=".txt,.md"
              onChange={handleStoryFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => storyFileInputRef.current?.click()}
              className="btn-ghost text-xs py-2 px-3"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.story.uploadFileBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary text-xs py-2 px-3"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddForm ? t.story.closeFormBtn : t.story.addManualBtn}</span>
            </button>
          </div>
        </div>

        {/* Thanh thông tin Repo & Bộ lọc Quyển / Lứa tuổi */}
        {selectedStory && (
          <div className="space-y-3 pt-2.5 border-t border-line/60">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-inkSoft">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-leaf">{selectedStory.ageRange}</span>
                <span className="badge-sand">
                  {selectedStory.scenes.length} {t.story.scenesCountSuffix}
                </span>
                {selectedStory.repoUrl && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3EFE0]/85 text-forestDark font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                    <span>{t.story.repo.syncedLabel}</span>
                    {lastSyncedText && (
                      <span className="text-[11px] text-inkSoft font-normal">
                        · {t.story.repo.lastSyncedPrefix}: {lastSyncedText}
                      </span>
                    )}
                  </span>
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
                  title={`${t.story.repo.folderPathLabel}: ${activeRepoPath}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF4E8] border border-line text-[11px] text-forestDark hover:border-forest/50 hover:underline max-w-full"
                >
                  <FolderGit2 className="w-3 h-3 text-forest flex-shrink-0" />
                  <code className="text-terra truncate max-w-[180px] sm:max-w-[260px]">
                    {activeRepoPath}
                  </code>
                  <ExternalLink className="w-3 h-3 text-forest flex-shrink-0" />
                </a>
              )}
            </div>

            {syncNotice && !syncError && (
              <div className="text-xs text-forestDark bg-[#E3EFE0]/70 border border-forest/25 rounded-lg px-3 py-1.5">
                {syncNotice}
              </div>
            )}

            {syncError && (
              <div className="text-xs text-terra bg-[#FDF2F0] border border-terra/30 rounded-lg px-3 py-1.5">
                {syncError}
              </div>
            )}

            {/* Chọn Quyển (Quyển I – V) & Biến thể Lứa tuổi (3–5, 6–10, 11+) */}
            {books.length > 0 && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t.story.repo.bookFilterLabel}>
                  <span className="text-xs font-semibold text-forestDark mr-1">
                    {t.story.repo.bookFilterLabel}:
                  </span>
                  <button
                    type="button"
                    aria-pressed={selectedBookId === "all"}
                    onClick={() => handleBookSelect("all")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selectedBookId === "all"
                        ? "bg-forest text-white border-forest shadow-sm"
                        : "bg-white text-ink border-line hover:bg-[#FAF3E3]"
                    }`}
                  >
                    {t.story.repo.allBooksOption} ({allScenes.length})
                  </button>
                  {books.map((bk) => (
                    <button
                      type="button"
                      key={bk.id}
                      aria-pressed={selectedBookId === bk.id}
                      onClick={() => handleBookSelect(bk.id)}
                      title={bk.title}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        selectedBookId === bk.id
                          ? "bg-forest text-white border-forest shadow-sm"
                          : "bg-white text-ink border-line hover:bg-[#FAF3E3]"
                      }`}
                    >
                      {bk.isEpilogue
                        ? lang === "en"
                          ? "Book V · Epilogue"
                          : "Quyển V · Ngoại truyện"
                        : lang === "en"
                        ? `Book ${bk.number}`
                        : `Quyển ${bk.number}`}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-forestDark whitespace-nowrap">
                    {t.story.repo.ageVariantLabel}:
                  </span>
                  <div
                    className="inline-flex rounded-xl bg-[#F3E9D4] p-1 border border-line"
                    role="group"
                    aria-label={t.story.repo.ageVariantLabel}
                  >
                    {AGE_VARIANTS.map((v) => {
                      const active = selectedAgeVariant === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSelectedAgeVariant(v)}
                          title={t.story.repo.ageVariants[v]}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            active
                              ? "bg-forest text-white shadow-sm"
                              : "text-forestDark hover:bg-white/75"
                          }`}
                        >
                          {t.story.repo.ageVariantsShort[v]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Khung thêm truyện mới */}
      {showAddForm && (
        <section className="garden-card bg-[#FDFBF7] border-2 border-forest/30 space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-forestDark">
              {t.story.addFormTitle}
            </h2>
            <p className="text-xs text-inkSoft mt-0.5">{t.story.addFormSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.fieldTitle}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="VD: Sự tích Dưa hấu"
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.fieldAge}
              </label>
              <input
                type="text"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.fieldStyle}
              </label>
              <select
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value as WaldorfArtStyle)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
              >
                <option value="wet-on-wet">{t.story.level4.styleWetOnWet}</option>
                <option value="crayon">{t.story.level4.styleCrayon}</option>
                <option value="chalkboard">{t.story.level4.styleChalkboard}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.fieldCulturalSpirit}
              </label>
              <input
                type="text"
                value={newCulturalSpirit}
                onChange={(e) => setNewCulturalSpirit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.fieldRhythm}
              </label>
              <input
                type="text"
                value={newRhythm}
                onChange={(e) => setNewRhythm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.fieldMetaphor}
              </label>
              <input
                type="text"
                value={newMetaphor}
                onChange={(e) => setNewMetaphor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forestDark mb-1">
              {t.story.fieldFullText}
            </label>
            <textarea
              rows={6}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Dán toàn văn câu chuyện vào đây. Tách mỗi phân cảnh bằng một dòng trống..."
              className="w-full p-3 rounded-lg border border-line bg-white text-sm font-sans"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveNewStory}
            disabled={!newText.trim()}
            className="btn-primary text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.story.saveStoryBtn}</span>
          </button>
        </section>
      )}

      {/* Thanh chọn 5 Level luyện tập */}
      {selectedStory && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="tablist" aria-label={t.story.pageTitle}>
            {PRACTICE_LEVELS.map((lvl) => {
              const meta = t.story.levels[lvl];
              const isActive = activeLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveLevel(lvl)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    lvl === 4 ? "col-span-2 sm:col-span-1" : ""
                  } ${
                    isActive
                      ? "bg-forest text-white border-forest shadow-md"
                      : "bg-card text-ink border-line hover:border-forest/50 hover:bg-[#FAF3E3]"
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isActive ? "text-[#E9C46A]" : "text-terra"
                    }`}
                  >
                    {meta.badge}
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-serif font-bold mt-0.5 leading-snug ${
                      isActive ? "text-white" : "text-forestDark"
                    }`}
                  >
                    {meta.shortTitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mô tả cấp độ đang chọn */}
          <div className="p-4 rounded-2xl bg-[#F7ECD8]/70 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-forestDark">
                {currentLevelMeta.title}
              </h2>
              <p className="text-xs sm:text-sm text-inkSoft mt-0.5 leading-relaxed">
                {currentLevelMeta.description}
              </p>
            </div>
            <span className="text-xs font-serif font-semibold text-forest self-start sm:self-center flex-shrink-0">
              {displayTitle}
            </span>
          </div>

          {/* ============================================================== */}
          {/* LEVEL 0: KHÔNG GIAN BỐI CẢNH & LINH HỒN CÂU CHUYỆN             */}
          {/* ============================================================== */}
          {activeLevel === 0 && activeSoul && (
            <div className="space-y-4">
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
                          ? t.story.level0.epicOverviewToggleClose
                          : t.story.level0.epicOverviewToggleOpen}
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
                      <span>{t.story.level0.epicOverviewToggleOpen}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowEpicOverview(false)}
                      className="btn-ghost text-xs py-1 px-2"
                      aria-label={t.story.level0.epicOverviewToggleClose}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto text-sm text-ink leading-relaxed whitespace-pre-line pr-2 font-serif">
                    {formatMarkdownForReading(selectedStory.soul.overviewMarkdown)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="garden-card space-y-2.5 bg-[#FFFDF8]">
                  <div className="flex items-center gap-2 text-forestDark font-serif font-bold text-base">
                    <Compass className="w-4 h-4 text-forest flex-shrink-0" />
                    <h3>{t.story.level0.culturalSpiritTitle}</h3>
                  </div>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                    {activeSoul.culturalSpirit}
                  </p>
                </div>

                <div className="garden-card space-y-2.5 bg-[#FFFDF8]">
                  <div className="flex items-center gap-2 text-forestDark font-serif font-bold text-base">
                    <Wind className="w-4 h-4 text-terra flex-shrink-0" />
                    <h3>{t.story.level0.rhythmTitle}</h3>
                  </div>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                    {activeSoul.storytellingRhythm}
                  </p>
                </div>

                <div className="garden-card space-y-2.5 bg-[#FFFDF8]">
                  <div className="flex items-center gap-2 text-forestDark font-serif font-bold text-base">
                    <Heart className="w-4 h-4 text-terra flex-shrink-0" />
                    <h3>{t.story.level0.metaphorTitle}</h3>
                  </div>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                    {activeMetaphor}
                  </p>
                </div>
              </div>

              {/* Cách phát âm tên cổ & thuật ngữ văn hóa */}
              <div className="garden-card space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-line">
                  <Volume2 className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-base font-bold text-forestDark">
                    {t.story.level0.pronunciationTitle}
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
                    {activeAncientBook && (
                      <button
                        type="button"
                        onClick={() => setActiveAncientBook(null)}
                        className="btn-ghost text-xs py-1 px-2.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t.story.repo.closeAncientBook}</span>
                      </button>
                    )}
                  </div>

                  {/* Bộ lọc danh mục văn bản cổ */}
                  <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t.story.repo.ancientBooksTitle}>
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
                      const isOpen = activeAncientBook?.id === ab.id;
                      return (
                        <button
                          key={ab.id}
                          type="button"
                          aria-pressed={isOpen}
                          onClick={() => handleOpenAncientBook(ab)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs border transition text-left ${
                            isOpen
                              ? "bg-forest text-white border-forest"
                              : "bg-[#FDFBF5] text-ink border-line hover:border-forest/50 hover:bg-[#FAF3E3]"
                          }`}
                        >
                          {ab.title}
                        </button>
                      );
                    })}
                  </div>

                  {activeAncientBook && (
                    <div className="p-4 rounded-xl bg-[#FFFDF9] border border-forest/30 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                        <div>
                          <h4 className="font-serif font-bold text-base text-forestDark">
                            {activeAncientBook.title}
                          </h4>
                          <code className="text-[11px] text-terra">{activeAncientBook.file}</code>
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
                          <span>{t.story.repo.openOnGitHub}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {ancientBookLoading && (
                        <p className="text-xs text-inkSoft italic">
                          {t.story.repo.ancientBookLoading}
                        </p>
                      )}
                      {ancientBookError && (
                        <p className="text-xs text-terra">{ancientBookError}</p>
                      )}
                      {ancientBookContent && (
                        <div className="max-h-96 overflow-y-auto text-sm text-ink leading-relaxed whitespace-pre-line pr-2 font-serif">
                          {formatMarkdownForReading(ancientBookContent)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button type="button" onClick={() => setActiveLevel(1)} className="btn-primary text-sm">
                  <span>{t.story.level0.nextLevelBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 1: TOÀN VĂN CÂU CHUYỆN + LƯU Ý GIỌNG KỂ                  */}
          {/* ============================================================== */}
          {activeLevel === 1 && (
            <div className="garden-card space-y-5">
              {/* Chuyển đổi Xem từng phân cảnh / Liền mạch + Cỡ chữ */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-xl bg-[#F7ECD8]/70 p-1 border border-line">
                    <button
                      type="button"
                      onClick={() => setLevel1FlowMode("scene")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        level1FlowMode === "scene"
                          ? "bg-forest text-white shadow-sm"
                          : "text-forestDark hover:bg-white/60"
                      }`}
                    >
                      {t.story.level1.viewByScene}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevel1FlowMode("full")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        level1FlowMode === "full"
                          ? "bg-forest text-white shadow-sm"
                          : "text-forestDark hover:bg-white/60"
                      }`}
                    >
                      {t.story.level1.viewFullFlow}
                    </button>
                  </div>

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

                {level1FlowMode === "scene" && (
                  <SceneNavControls
                    activeIndex={safeSceneIndex}
                    total={totalScenes}
                    scenes={visibleScenes}
                    onPrev={handlePrevScene}
                    onNext={handleNextScene}
                    onSelect={setActiveSceneIndex}
                    sceneLabel={t.story.nav.sceneLabel}
                    prevLabel={t.story.nav.prevScene}
                    nextLabel={t.story.nav.nextScene}
                  />
                )}
              </div>

              {level1FlowMode === "scene" && currentScene ? (
                <div
                  className="space-y-4 max-w-[68ch] mx-auto py-2"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <h3 className="font-serif text-xl font-bold text-forestDark">
                    {currentScene.title}
                  </h3>

                  {/* Đặt Lưu ý giọng kể lên đầu để người kể lấy hơi & tông giọng trước khi đọc */}
                  <div className="p-4 rounded-xl bg-[#E3EFE0]/70 border border-[#C5DEC0] space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4" />
                      <span>{t.story.level1.voiceNoteLabel}</span>
                    </div>
                    <p className="text-sm text-forestDark leading-relaxed italic whitespace-pre-line">
                      {currentVoiceNote}
                    </p>
                  </div>

                  <p
                    className={`font-serif text-ink whitespace-pre-line bg-[#FFFDF9] p-5 sm:p-6 rounded-2xl border border-line shadow-sm ${
                      level1TextSize === "sm"
                        ? "text-sm sm:text-base leading-[1.8]"
                        : level1TextSize === "lg"
                        ? "text-lg sm:text-xl leading-[1.9]"
                        : "text-base sm:text-lg leading-[1.85]"
                    }`}
                  >
                    {currentPassage}
                  </p>

                  <div className="flex justify-center pt-1">
                    <SceneNavControls
                      activeIndex={safeSceneIndex}
                      total={totalScenes}
                      scenes={visibleScenes}
                      onPrev={handlePrevScene}
                      onNext={handleNextScene}
                      onSelect={setActiveSceneIndex}
                      sceneLabel={t.story.nav.sceneLabel}
                      prevLabel={t.story.nav.prevScene}
                      nextLabel={t.story.nav.nextScene}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-[68ch] mx-auto py-2">
                  {visibleScenes.map((sc, idx) => {
                    const variant = getSceneVariant(sc);
                    const scPassage = variant?.passage || sc.passage;
                    const scVoiceNote = variant?.voiceNote || sc.voiceNote;
                    return (
                      <div
                        key={sc.id}
                        className="space-y-3 pb-6 border-b border-line/70 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-serif text-lg font-bold text-forestDark">
                            {sc.title}
                          </h3>
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
                            <span className="whitespace-pre-line">{scVoiceNote}</span>
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
                          {scPassage}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <LevelStepFooter
                activeLevel={activeLevel}
                onSelectLevel={setActiveLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 2: DÀN Ý CHI TIẾT (KHÔNG NHÌN TOÀN VĂN)                  */}
          {/* ============================================================== */}
          {activeLevel === 2 && currentScene && currentOutline && (
            <div
              className="garden-card space-y-5"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-forestDark">
                  {currentScene.title}
                </h3>
                <SceneNavControls
                  activeIndex={safeSceneIndex}
                  total={totalScenes}
                  scenes={visibleScenes}
                  onPrev={handlePrevScene}
                  onNext={handleNextScene}
                  onSelect={setActiveSceneIndex}
                  sceneLabel={t.story.nav.sceneLabel}
                  prevLabel={t.story.nav.prevScene}
                  nextLabel={t.story.nav.nextScene}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nhân vật */}
                <div className="p-4 rounded-xl bg-[#FDFBF5] border border-line space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{t.story.level2.charactersLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentOutline.characters.map((ch, idx) => (
                      <span key={idx} className="badge-leaf text-xs font-semibold">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nhịp cảm xúc theo lứa tuổi */}
                <div className="p-4 rounded-xl bg-[#FDF0E6]/70 border border-[#E8D0B8] space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-terra flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>{t.story.level2.emotionalRhythmLabel}</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed">
                    {currentOutline.emotionalRhythm}
                  </p>
                </div>
              </div>

              {/* Chi tiết bản địa hóa & giác quan */}
              <div className="p-4 rounded-xl bg-[#FFFDF8] border border-line space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-forestDark flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-terra" />
                  <span>{t.story.level2.localizedDetailsLabel}</span>
                </div>
                <ul className="space-y-1.5 text-sm text-ink list-disc list-inside">
                  {currentOutline.localizedDetails.map((detail, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Diễn biến chi tiết */}
              <div className="p-4 rounded-xl bg-[#FFFDF8] border border-line space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-forestDark flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-forest" />
                  <span>{t.story.level2.beatsLabel}</span>
                </div>
                <ol className="space-y-2 text-sm text-ink">
                  {currentOutline.beats.map((beat, idx) => (
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
                <SceneNavControls
                  activeIndex={safeSceneIndex}
                  total={totalScenes}
                  scenes={visibleScenes}
                  onPrev={handlePrevScene}
                  onNext={handleNextScene}
                  onSelect={setActiveSceneIndex}
                  sceneLabel={t.story.nav.sceneLabel}
                  prevLabel={t.story.nav.prevScene}
                  nextLabel={t.story.nav.nextScene}
                />
              </div>

              <LevelStepFooter
                activeLevel={activeLevel}
                onSelectLevel={setActiveLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 3: DÀN Ý TÓM TẮT (1 BẢN KHUNG XƯƠNG DUY NHẤT)            */}
          {/* ============================================================== */}
          {activeLevel === 3 && (
            <div className="garden-card space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-forest" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-forestDark">
                      {t.story.level3.skeletonHeader}: {displayTitle}
                    </h3>
                    <p className="text-xs text-inkSoft italic">
                      {t.story.level3.jumpToSceneHint}
                    </p>
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
                    <SceneNavControls
                      activeIndex={safeSceneIndex}
                      total={totalScenes}
                      scenes={visibleScenes}
                      onPrev={handlePrevScene}
                      onNext={handleNextScene}
                      onSelect={setActiveSceneIndex}
                      sceneLabel={t.story.nav.sceneLabel}
                      prevLabel={t.story.nav.prevScene}
                      nextLabel={t.story.nav.nextScene}
                    />
                  )}
                </div>
              </div>

              {/* 1 bản khung xương duy nhất trải suốt các phân cảnh đang chọn */}
              <div className="space-y-4">
                {(level3Scope === "current" && currentScene
                  ? [{ sc: currentScene, idx: safeSceneIndex }]
                  : visibleScenes.map((sc, idx) => ({ sc, idx }))
                ).map(({ sc, idx }) => {
                  const isFocused = idx === safeSceneIndex;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => setActiveSceneIndex(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isFocused
                          ? "bg-[#E3EFE0]/50 border-forest shadow-sm"
                          : "bg-[#FFFDF8] border-line hover:border-forest/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <h4 className="font-serif font-bold text-base text-forestDark">
                          {sc.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge-sand text-[11px]">
                            {sc.summaryPoints.length} {t.story.level3.pointsBadge}
                          </span>
                          {isFocused && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSceneIndex(idx);
                                setActiveLevel(4);
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
                onSelectLevel={setActiveLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* LEVEL 4: TRANH GỢI NHỚ THUẦN HÌNH ẢNH (KHÔNG CHỮ GỢI Ý)        */}
          {/* ============================================================== */}
          {activeLevel === 4 && currentScene && (
            <div
              className="garden-card space-y-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Thanh công cụ tối giản — không hiển thị tiêu đề hay chữ gợi ý cốt truyện */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <SceneNavControls
                    activeIndex={safeSceneIndex}
                    total={totalScenes}
                    scenes={visibleScenes}
                    onPrev={handlePrevScene}
                    onNext={handleNextScene}
                    onSelect={setActiveSceneIndex}
                    sceneLabel={t.story.nav.sceneLabel}
                    prevLabel={t.story.nav.prevScene}
                    nextLabel={t.story.nav.nextScene}
                  />
                  <span className="badge-sand text-[11px]">
                    {shouldShowRepoImg || currentScene.imagePath
                      ? t.story.level4.artModeRepoBadge
                      : t.story.level4.artModeProceduralBadge}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="level4-art-style"
                    className="text-xs font-semibold text-forestDark flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-forest" />
                    <span>{t.story.level4.artStyleLabel}:</span>
                  </label>
                  <select
                    id="level4-art-style"
                    value={currentScene.artStyle}
                    onChange={(e) => {
                      setPreferProceduralArt(true);
                      handleSceneArtStyleChange(e.target.value as WaldorfArtStyle);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs font-medium text-ink"
                  >
                    <option value="wet-on-wet">{t.story.level4.styleWetOnWet}</option>
                    <option value="crayon">{t.story.level4.styleCrayon}</option>
                    <option value="chalkboard">{t.story.level4.styleChalkboard}</option>
                  </select>

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
                    title={t.story.level4.uploadCustomImageBtn}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {t.story.level4.uploadCustomImageBtn}
                    </span>
                  </button>

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

                  {(currentScene.imagePath || preferProceduralArt) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreferProceduralArt(false);
                        handleResetSceneImage();
                      }}
                      className="btn-ghost text-xs py-1.5 px-2.5 text-terra"
                      title={t.story.level4.resetProceduralBtn}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Khung tranh thuần hình ảnh — tuyệt đối không chữ gợi ý */}
              <div
                className={`relative w-full mx-auto aspect-[16/10] rounded-2xl overflow-hidden border-2 border-line bg-[#FAF6EC] shadow-md group transition-all ${
                  isLevel4StageMode ? "max-w-5xl" : "max-w-3xl"
                }`}
              >
                <img
                  src={level4ImgSrc}
                  alt=""
                  aria-label={`${t.story.nav.sceneLabel} ${currentScene.ord}`}
                  onError={() => {
                    if (repoImgUrl && !failedRepoImages[repoImgUrl]) {
                      setFailedRepoImages((prev) => ({ ...prev, [repoImgUrl]: true }));
                    }
                  }}
                  className={`w-full h-full select-none ${
                    shouldShowRepoImg || currentScene.imagePath
                      ? "object-contain"
                      : "object-cover"
                  }`}
                />

                {safeSceneIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevScene}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-forestDark shadow-md transition backdrop-blur-sm opacity-75 group-hover:opacity-100"
                    aria-label={t.story.nav.prevScene}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {safeSceneIndex < totalScenes - 1 && (
                  <button
                    type="button"
                    onClick={handleNextScene}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-forestDark shadow-md transition backdrop-blur-sm opacity-75 group-hover:opacity-100"
                    aria-label={t.story.nav.nextScene}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-inkSoft italic">
                {t.story.level4.swipeHint}
              </p>

              <LevelStepFooter
                activeLevel={activeLevel}
                onSelectLevel={setActiveLevel}
                prevPrefix={t.story.nav.prevLevelBtn}
                nextPrefix={t.story.nav.nextLevelShortBtn}
              />
            </div>
          )}
        </section>
      )}

      {/* ================================================================== */}
      {/* THANH THU ÂM & NGHE LẠI (CHỈ THU ÂM VÀ PHÁT LẠI, KHÔNG ĐÁNH GIÁ)   */}
      {/* ================================================================== */}
      {selectedStory && (
        <aside
          aria-label="Thanh thu âm và nghe lại giọng kể"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl space-y-2"
        >
          {/* Danh sách các bản thu trong phiên (thu gọn/mở rộng) */}
          {showTakesPanel && recordings.length > 0 && (
            <div className="bg-[#FFFDF7]/98 backdrop-blur-md border border-line rounded-2xl shadow-xl p-3.5 max-h-60 overflow-y-auto space-y-2">
              {recordings.map((rec) => {
                const isCurrentSceneTake = Boolean(
                  currentScene && rec.sceneOrd === currentScene.ord && rec.storyId === selectedStory.id
                );
                return (
                  <div
                    key={rec.id}
                    className={`flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border ${
                      activeRecording?.id === rec.id
                        ? "bg-[#E3EFE0]/60 border-forest/40"
                        : "bg-white border-line"
                    }`}
                  >
                    <div className="text-xs font-medium text-forestDark min-w-[140px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold">{rec.label}</span>
                        {isCurrentSceneTake && (
                          <span className="badge-leaf text-[10px] py-0 px-1.5">
                            {t.story.recorder.currentSceneBadge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-inkSoft">
                        {formatDuration(rec.durationSeconds)} · {rec.createdAt}
                      </div>
                    </div>

                    <audio controls src={rec.audioUrl} className="h-8 flex-1 min-w-[180px]" />

                    <div className="flex items-center gap-1">
                      <a
                        href={rec.audioUrl}
                        download={`ke-chuyen-L${rec.level}-c${rec.sceneOrd}.webm`}
                        className="p-1.5 rounded-lg border border-line text-forest hover:bg-[#F7ECD8] transition"
                        title={t.story.recorder.downloadTake}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecording(rec.id)}
                        className="p-1.5 rounded-lg border border-line text-terra hover:bg-[#F7DDD6]/50 transition"
                        title={t.story.recorder.deleteTake}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {micError && (
            <div className="px-4 py-2 rounded-xl bg-[#FDF2F0] border border-terra/40 text-xs text-terra font-medium text-center shadow">
              {micError}
            </div>
          )}

          {/* Thanh điều khiển chính */}
          <div className="bg-[#FFFDF7]/95 backdrop-blur-md border-2 border-forest/30 shadow-2xl rounded-2xl px-3.5 py-2.5 sm:px-5 flex flex-wrap items-center justify-between gap-3">
            {/* Chỉ báo Level & Phân cảnh hiện tại */}
            <div className="flex items-center gap-2">
              <span className="badge-leaf font-bold text-xs">Level {activeLevel}</span>
              {totalScenes > 0 && activeLevel !== 0 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevScene}
                    disabled={safeSceneIndex <= 0}
                    className="p-1 rounded-lg border border-line bg-white text-forestDark hover:bg-[#F7ECD8] disabled:opacity-30 disabled:pointer-events-none"
                    aria-label={t.story.nav.prevScene}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-serif font-bold text-forestDark px-1 whitespace-nowrap">
                    {currentScene?.ord || safeSceneIndex + 1}/{allScenes.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextScene}
                    disabled={safeSceneIndex >= totalScenes - 1}
                    className="p-1 rounded-lg border border-line bg-white text-forestDark hover:bg-[#F7ECD8] disabled:opacity-30 disabled:pointer-events-none"
                    aria-label={t.story.nav.nextScene}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Nút Thu âm / Dừng thu + Nghe lại bản vừa thu */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2 rounded-xl bg-terra hover:bg-[#a84736] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>{t.story.recorder.recordBtn}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md animate-pulse transition active:scale-95"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>{t.story.recorder.stopBtn}</span>
                  <span className="font-mono text-xs bg-red-900/60 px-1.5 py-0.5 rounded">
                    {formatDuration(recordingSeconds)}
                  </span>
                </button>
              )}

              {activeRecording && !isRecording ? (
                <audio
                  controls
                  src={activeRecording.audioUrl}
                  className="h-8 w-44 sm:w-56"
                />
              ) : (
                !isRecording && (
                  <span className="text-xs text-inkSoft hidden sm:inline">
                    {t.story.recorder.noRecordingYet}
                  </span>
                )
              )}

              {recordings.length > 0 && (
                <button
                  type="button"
                  aria-expanded={showTakesPanel}
                  onClick={() => setShowTakesPanel((v) => !v)}
                  className="btn-ghost text-xs py-1.5 px-2.5"
                  title={t.story.recorder.showTakesBtn}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>{recordings.length}</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
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
  const prevLevel = activeLevel > 0 ? ((activeLevel - 1) as PracticeLevel) : null;
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

function SceneNavControls({
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
              aria-label={`${sceneLabel} ${scenes[idx]?.ord || idx + 1}`}
            />
          ))}
        </div>
      ) : (
        <select
          value={activeIndex}
          onChange={(e) => onSelect(Number(e.target.value))}
          aria-label={sceneLabel}
          className="px-2 py-1 rounded-lg border border-line bg-white text-xs font-medium text-forestDark max-w-[160px]"
        >
          {scenes.map((sc, idx) => (
            <option key={sc.id} value={idx}>
              {sceneLabel} {sc.ord}
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
