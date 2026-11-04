"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import {
  WaldorfArtStyle,
  StoryScene,
  AudioDeliveryMetrics,
  PracticeAttempt,
  StoryViewMode,
  ReaderViewMode,
} from "@/lib/types";
import { ProceduralIllustrator } from "@/lib/art/proceduralIllustrator";
import { WavAnalyzer } from "@/lib/audio/wavAnalyzer";
import { DialectAdaptationEngine } from "@/lib/dialect/dialectEngine";
import { ModelGateway } from "@/lib/ai/modelGateway";
import {
  BookOpen,
  Book,
  Mic,
  Square,
  Upload,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Edit2,
  Check,
  Volume2,
  Brain,
  Heart,
  Eye,
  Wind,
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Clock,
  Bookmark,
} from "lucide-react";

const cleanKeyword = (kw: string) =>
  kw.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“”’—–]/g, "").trim();

const stopWordSet = new Set([
  "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "by", "from",
  "is", "it", "this", "that", "there", "then", "their", "they", "was", "were", "be",
  "as", "of", "into", "within", "over", "under", "all", "so", "no", "not", "when",
  "his", "her", "him", "who", "whose", "had", "have", "has", "could", "would",
  "và", "hoặc", "trong", "trên", "tại", "cho", "với", "từ", "của", "những", "các", "một",
  "đã", "đang", "sẽ", "là", "thì", "mà", "nhưng", "được", "bị", "bởi",
  "khi", "này", "đó", "ra", "vào", "lại", "rồi", "lúc", "người", "như", "rất", "cũng"
]);

const sanitizeKeywords = (keywords?: string[]): string[] => {
  if (!keywords || !Array.isArray(keywords)) return [];
  return keywords
    .map(cleanKeyword)
    .filter((w) => w.length > 2 && !stopWordSet.has(w.toLowerCase()))
    .slice(0, 5);
};

export default function StoryPage() {
  const {
    data,
    updateData,
    selectedStory,
    setSelectedStoryId,
    googleApiKey,
    metaApiKey,
    aiProvider,
    t,
    lang,
  } = useApp();

  // View Mode: Retelling Studio vs Storybook Reader
  const [viewMode, setViewMode] = useState<StoryViewMode>("studio");
  const [readerStyle, setReaderStyle] = useState<ReaderViewMode>("picture-book");
  const [isFullStoryOpen, setIsFullStoryOpen] = useState(false);

  // Practice & Form states
  const [practiceMode, setPracticeMode] = useState<"prompt" | "fading" | "free">("prompt");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAge, setUploadAge] = useState("8–9");
  const [uploadStyle, setUploadStyle] = useState<WaldorfArtStyle>("wet-on-wet");
  const [uploadGoal, setUploadGoal] = useState("Warm, imagery-rich oral retelling");
  const [uploadText, setUploadText] = useState("");
  const [autoGenerateArtOnUpload, setAutoGenerateArtOnUpload] = useState(true);

  // Active scene & carousel/swipe state
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isSegmenting, setIsSegmenting] = useState(false);

  // Scene editing state
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [isGeneratingAllScenes, setIsGeneratingAllScenes] = useState(false);

  // Recording & live speech dictation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioMetrics, setAudioMetrics] = useState<AudioDeliveryMetrics | null>(null);
  const [transcript, setTranscript] = useState("");
  const [rawTranscript, setRawTranscript] = useState("");
  const [interimSpoken, setInterimSpoken] = useState("");
  const [consentGranted, setConsentGranted] = useState(false);
  const [dialectNotice, setDialectNotice] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);

  // Free practice reveal state
  const [isFreePracticeRevealed, setIsFreePracticeRevealed] = useState(false);

  // Refs for audio recording & speech recognition
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef("");
  const recordingIntervalRef = useRef<any>(null);

  // Keep transcriptRef synchronized with transcript state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Check speech recognition support once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeech = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
      setSpeechSupported(hasSpeech);
    }
  }, []);

  // When active story changes, reset retelling state cleanly
  useEffect(() => {
    if (selectedStory) {
      setTranscript("");
      setRawTranscript("");
      setInterimSpoken("");
      setRecordedAudioUrl(null);
      setAudioMetrics(null);
      setActiveSceneIndex(0);
      setIsFreePracticeRevealed(false);
    }
  }, [selectedStory?.id]);

  // Clean up recording interval on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  // Keyboard navigation for scenes / book pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        handlePrevScene();
      } else if (e.key === "ArrowRight") {
        handleNextScene();
      } else if (e.key === "Escape" && isFullStoryOpen) {
        setIsFullStoryOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory?.scenes?.length, activeSceneIndex, isFullStoryOpen]);

  // Generate AI artwork for a single scene
  const handleGenerateSceneArt = async (sceneId: string) => {
    if (!selectedStory) return;
    const targetScene = selectedStory.scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => {
        if (s.id !== selectedStory.id) return s;
        return {
          ...s,
          scenes: s.scenes.map((sc) => (sc.id === sceneId ? { ...sc, isGenerating: true } : sc)),
        };
      }),
    }));

    try {
      const result = await ModelGateway.generateSceneArtwork({
        scene: targetScene,
        style: targetScene.artStyle,
        provider: aiProvider,
        googleApiKey,
        metaApiKey,
      });

      updateData((prev) => ({
        ...prev,
        stories: prev.stories.map((s) => {
          if (s.id !== selectedStory.id) return s;
          return {
            ...s,
            scenes: s.scenes.map((sc) => {
              if (sc.id !== sceneId) return sc;
              return {
                ...sc,
                imagePath: result.imageUrl,
                imageSourceLabel: result.sourceLabel,
                isGenerating: false,
                generationError: result.error || null,
              };
            }),
          };
        }),
      }));
    } catch (err: any) {
      console.warn("Failed to generate scene art:", err);
      updateData((prev) => ({
        ...prev,
        stories: prev.stories.map((s) => {
          if (s.id !== selectedStory.id) return s;
          return {
            ...s,
            scenes: s.scenes.map((sc) =>
              sc.id === sceneId ? { ...sc, isGenerating: false, generationError: err.message } : sc
            ),
          };
        }),
      }));
    }
  };

  // Generate AI art for ALL scenes in the active story
  const handleGenerateAllScenesArt = async () => {
    if (!selectedStory || isGeneratingAllScenes) return;
    setIsGeneratingAllScenes(true);

    try {
      for (const sc of selectedStory.scenes) {
        updateData((prev) => ({
          ...prev,
          stories: prev.stories.map((s) => {
            if (s.id !== selectedStory.id) return s;
            return {
              ...s,
              scenes: s.scenes.map((curr) =>
                curr.id === sc.id ? { ...curr, isGenerating: true } : curr
              ),
            };
          }),
        }));

        try {
          const res = await ModelGateway.generateSceneArtwork({
            scene: sc,
            style: sc.artStyle,
            provider: aiProvider,
            googleApiKey,
            metaApiKey,
          });

          updateData((prev) => ({
            ...prev,
            stories: prev.stories.map((s) => {
              if (s.id !== selectedStory.id) return s;
              return {
                ...s,
                scenes: s.scenes.map((curr) =>
                  curr.id === sc.id
                    ? {
                        ...curr,
                        imagePath: res.imageUrl,
                        imageSourceLabel: res.sourceLabel,
                        isGenerating: false,
                        generationError: null,
                      }
                    : curr
                ),
              };
            }),
          }));
        } catch (sceneErr: any) {
          console.warn("Error generating art for scene", sc.ord, sceneErr);
          updateData((prev) => ({
            ...prev,
            stories: prev.stories.map((s) => {
              if (s.id !== selectedStory.id) return s;
              return {
                ...s,
                scenes: s.scenes.map((curr) =>
                  curr.id === sc.id
                    ? { ...curr, isGenerating: false, generationError: sceneErr.message }
                    : curr
                ),
              };
            }),
          }));
        }
      }
    } finally {
      setIsGeneratingAllScenes(false);
    }
  };

  // Upload/Manual story submission
  const handleSaveUploadedStory = async () => {
    if (!uploadText.trim()) return;
    setIsSegmenting(true);

    const title = uploadTitle.trim() || uploadText.trim().split("\n")[0].substring(0, 40) + "...";
    let generatedScenes: StoryScene[] = [];
    try {
      generatedScenes = await ModelGateway.segmentStoryIntoScenes({
        storyText: uploadText,
        storyTitle: title,
        artStyle: uploadStyle,
        provider: aiProvider,
        googleApiKey,
        metaApiKey,
      });
    } catch (segErr) {
      console.warn("Context segmentation error:", segErr);
      generatedScenes = ModelGateway.segmentLocallyByContext(uploadText, title, uploadStyle);
    }

    if (!generatedScenes || generatedScenes.length === 0) {
      generatedScenes = ModelGateway.segmentLocallyByContext(uploadText, title, uploadStyle);
    }

    const newStory = {
      id: `story-${Date.now()}`,
      title,
      sourceText: uploadText,
      sourceInfo: "Uploaded by educator / parent",
      ageRange: uploadAge,
      goal: uploadGoal,
      defaultArtStyle: uploadStyle,
      scenes: generatedScenes,
    };

    updateData((prev) => ({
      ...prev,
      stories: [newStory, ...prev.stories],
    }));

    setSelectedStoryId(newStory.id);
    setActiveSceneIndex(0);
    setShowUploadForm(false);
    setUploadTitle("");
    setUploadText("");
    setIsSegmenting(false);

    if (autoGenerateArtOnUpload && (googleApiKey || metaApiKey)) {
      setTimeout(async () => {
        for (const sc of generatedScenes) {
          try {
            const res = await ModelGateway.generateSceneArtwork({
              scene: sc,
              style: sc.artStyle,
              provider: aiProvider,
              googleApiKey,
              metaApiKey,
            });
            updateData((prev) => ({
              ...prev,
              stories: prev.stories.map((s) => {
                if (s.id !== newStory.id) return s;
                return {
                  ...s,
                  scenes: s.scenes.map((curr) =>
                    curr.id === sc.id
                      ? { ...curr, imagePath: res.imageUrl, imageSourceLabel: res.sourceLabel }
                      : curr
                  ),
                };
              }),
            }));
          } catch (e) {
            console.warn("Auto art generation error for scene:", sc.id, e);
          }
        }
      }, 300);
    }
  };

  // Re-segment currently selected story
  const handleResegmentActiveStory = async () => {
    if (!selectedStory || isSegmenting) return;
    setIsSegmenting(true);

    try {
      const source =
        lang === "vi" && selectedStory.sourceTextVi
          ? selectedStory.sourceTextVi
          : selectedStory.sourceText;
      const title =
        lang === "vi" && selectedStory.titleVi ? selectedStory.titleVi : selectedStory.title;

      const newScenes = await ModelGateway.segmentStoryIntoScenes({
        storyText: source,
        storyTitle: title,
        artStyle: selectedStory.defaultArtStyle,
        provider: aiProvider,
        googleApiKey,
        metaApiKey,
      });

      if (newScenes && newScenes.length > 0) {
        updateData((prev) => ({
          ...prev,
          stories: prev.stories.map((s) =>
            s.id === selectedStory.id ? { ...s, scenes: newScenes } : s
          ),
        }));
        setActiveSceneIndex(0);
      }
    } catch (err) {
      console.warn("Re-segmenting active story error:", err);
    } finally {
      setIsSegmenting(false);
    }
  };

  const totalScenes = selectedStory?.scenes.length || 0;
  const currentScene =
    selectedStory?.scenes[activeSceneIndex] || selectedStory?.scenes[0];

  const handlePrevScene = () => {
    setActiveSceneIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextScene = () => {
    setActiveSceneIndex((prev) => Math.min(totalScenes - 1, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const deltaX = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (deltaX > minSwipeDistance) {
      handleNextScene();
    } else if (deltaX < -minSwipeDistance) {
      handlePrevScene();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Handle File Upload (.txt / .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setUploadText(text);
        setUploadTitle(file.name.replace(/\.(txt|md)$/i, ""));
        setShowUploadForm(true);
      }
    };
    reader.readAsText(file);
  };

  // Change style of all scenes in story
  const handleChangeStoryStyle = (newStyle: WaldorfArtStyle) => {
    if (!selectedStory) return;
    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => {
        if (s.id !== selectedStory.id) return s;
        return {
          ...s,
          defaultArtStyle: newStyle,
          scenes: s.scenes.map((sc) => ({
            ...sc,
            artStyle: newStyle,
            imageSourceLabel: sc.imagePath ? sc.imageSourceLabel : `Procedural Art (${newStyle})`,
          })),
        };
      }),
    }));
  };

  // Regenerate individual scene artwork with procedural fallback
  const handleRegenerateScene = (sceneId: string) => {
    if (!selectedStory) return;
    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => {
        if (s.id !== selectedStory.id) return s;
        return {
          ...s,
          scenes: s.scenes.map((sc) => {
            if (sc.id !== sceneId) return sc;
            return {
              ...sc,
              imagePath: null,
              imageSourceLabel: `Procedural Art (${sc.artStyle})`,
            };
          }),
        };
      }),
    }));
  };

  // Inline Scene Edit Save
  const handleSaveSceneEdit = (sceneId: string) => {
    if (!selectedStory) return;
    updateData((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => {
        if (s.id !== selectedStory.id) return s;
        return {
          ...s,
          scenes: s.scenes.map((sc) => {
            if (sc.id !== sceneId) return sc;
            return {
              ...sc,
              title: editTitle || sc.title,
              summary: editSummary || sc.summary,
            };
          }),
        };
      }),
    }));
    setEditingSceneId(null);
  };

  // Start In-Browser Audio Recording & Real-time Live Speech Dictation
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingDuration(0);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setInterimSpoken("");

      // Start Web Speech Recognition for live text streaming
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = lang === "vi" ? "vi-VN" : "en-US";

          let finalWords = transcript;

          rec.onresult = (event: any) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const piece = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalWords += (finalWords ? " " : "") + piece;
              } else {
                interim += piece;
              }
            }
            const fullLive = (finalWords + (interim ? " " + interim : "")).trim();
            setTranscript(fullLive);
            setRawTranscript(fullLive);
            setInterimSpoken(interim);
          };

          rec.onerror = (e: any) => {
            console.warn("Speech recognition warning:", e.error);
          };

          rec.onend = () => {
            if (isRecordingRef.current) {
              try {
                rec.start();
              } catch {}
            }
          };

          speechRecognitionRef.current = rec;
          rec.start();
        } catch (speechErr) {
          console.warn("Speech recognition init warning:", speechErr);
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        isRecordingRef.current = false;
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.stop();
          } catch {}
          speechRecognitionRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        setInterimSpoken("");

        // Perform direct acoustic analysis
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const currentSpokenText = transcriptRef.current;
          const metrics = WavAnalyzer.analyzeAudioBuffer(audioBuffer, currentSpokenText);
          setAudioMetrics(metrics);

          // Save attempt
          if (selectedStory) {
            const attempt: PracticeAttempt = {
              id: `attempt-${Date.now()}`,
              storyId: selectedStory.id,
              mode: practiceMode,
              rawTranscript: currentSpokenText,
              transcript: currentSpokenText,
              audioMetrics: metrics,
              appliedDialectRules: [],
              storySnapshot: selectedStory.sourceText,
              createdAt: new Date().toISOString(),
            };
            updateData((prev) => ({
              ...prev,
              attempts: [attempt, ...prev.attempts],
            }));
          }
        } catch (analErr) {
          console.warn("Acoustic analysis error:", analErr);
        }

        // Clean up tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required to record speech.");
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Save Transcript Correction & Extract Dialect Rule
  const handleSaveCorrectionAndDialect = () => {
    if (!transcript) return;
    const rule = DialectAdaptationEngine.extractCandidateRule(
      rawTranscript || selectedStory?.sourceText || "",
      transcript,
      "Learned from oral retelling"
    );

    if (rule) {
      updateData((prev) => ({
        ...prev,
        dialectRules: [rule, ...prev.dialectRules.filter((r) => r.rawPhrase !== rule.rawPhrase)],
      }));
      setDialectNotice(`Rule saved: "${rule.rawPhrase}" → "${rule.correctedPhrase}"`);
    } else {
      setDialectNotice("Transcript saved on device.");
    }
    setTimeout(() => setDialectNotice(""), 4000);
  };

  const activeStoryText = selectedStory
    ? lang === "vi" && selectedStory.sourceTextVi
      ? selectedStory.sourceTextVi
      : selectedStory.sourceText
    : "";

  const activeStoryTitle = selectedStory
    ? lang === "vi" && selectedStory.titleVi
      ? selectedStory.titleVi
      : selectedStory.title
    : "";

  const storyWordCount = activeStoryText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadMinutes = Math.max(1, Math.round(storyWordCount / 130));

  return (
    <div className="space-y-6 pb-28">
      <PageHeader title={t.story.title} subtitle={t.story.subtitle} />

      {/* Story Picker & Upload Bar */}
      <div className="garden-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-forestDark flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-forest" />
              {t.story.selectStory}:
            </span>
            <select
              value={selectedStory?.id || ""}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-line bg-white text-sm font-medium text-ink max-w-xs focus:outline-none focus:ring-2 focus:ring-forest"
            >
              {data.stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {lang === "vi" && story.titleVi ? story.titleVi : story.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.story.uploadFileBtn}</span>
            </button>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="btn-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showUploadForm ? t.story.closeForm : t.story.addManualBtn}</span>
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-inkSoft flex items-center justify-between">
          <span>
            {data.attempts.length} {t.story.statsInfo} · {data.dialectRules.length} rules
          </span>
          {selectedStory && (
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-forest" />
              <span>
                ~{estimatedReadMinutes} {t.story.minRead || "min read"} ({storyWordCount} words)
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Manual Upload Modal / Expandable Card */}
      {showUploadForm && (
        <div className="garden-card bg-[#FDFBF7] border-2 border-forest/30 space-y-4">
          <h3 className="font-serif text-lg font-bold text-forestDark">
            {t.story.manualCardTitle}
          </h3>
          <p className="text-xs text-inkSoft">{t.story.manualCardSubtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.storyTitleLabel}
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. The Golden River Seed"
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.targetAgeLabel}
              </label>
              <input
                type="text"
                value={uploadAge}
                onChange={(e) => setUploadAge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forestDark mb-1">
                {t.story.defaultStyleLabel}
              </label>
              <select
                value={uploadStyle}
                onChange={(e) => setUploadStyle(e.target.value as WaldorfArtStyle)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
              >
                <option value="wet-on-wet">{t.story.styleWetOnWet}</option>
                <option value="crayon">{t.story.styleCrayon}</option>
                <option value="chalkboard">{t.story.styleChalkboard}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forestDark mb-1">
              {t.story.pedagogicalGoalLabel}
            </label>
            <input
              type="text"
              value={uploadGoal}
              onChange={(e) => setUploadGoal(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forestDark mb-1">
              {t.story.fullStoryTextLabel}
            </label>
            <textarea
              rows={5}
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste story text here. Separate distinct scenes with empty lines..."
              className="w-full p-3 rounded-lg border border-line bg-white text-sm font-sans"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-forestDark">
            <input
              type="checkbox"
              id="auto-generate-art"
              checked={autoGenerateArtOnUpload}
              onChange={(e) => setAutoGenerateArtOnUpload(e.target.checked)}
              className="rounded text-forest focus:ring-forest"
            />
            <label htmlFor="auto-generate-art" className="cursor-pointer font-medium">
              {t.story.generateArtOnUpload}
            </label>
          </div>

          <button onClick={handleSaveUploadedStory} className="btn-primary text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{t.story.saveStoryBtn}</span>
          </button>
        </div>
      )}

      {selectedStory && (
        <div className="space-y-6">
          {/* PRIMARY VIEW MODE SWITCHER: RETELLING STUDIO vs STORYBOOK READER */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#F7ECD8]/80 rounded-2xl border border-line shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("studio")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                  viewMode === "studio"
                    ? "bg-forest text-white shadow"
                    : "bg-white/80 text-forestDark hover:bg-white border border-line"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t.story.studioTab || "Retelling Studio"}</span>
              </button>

              <button
                onClick={() => setViewMode("reader")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                  viewMode === "reader"
                    ? "bg-forest text-white shadow"
                    : "bg-white/80 text-forestDark hover:bg-white border border-line"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.story.readerTab || "Storybook Reader"}</span>
              </button>
            </div>

            {/* Quick action button based on current view mode */}
            {viewMode === "studio" ? (
              <button
                onClick={() => setIsFullStoryOpen(true)}
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 font-medium shadow-sm"
                title={t.story.readFullStoryBtn || "Read Full Story"}
              >
                <Book className="w-3.5 h-3.5 text-forest" />
                <span>{t.story.readFullStoryBtn || "Read Full Story"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-forestDark hidden sm:inline">
                  Style:
                </span>
                <div className="flex rounded-lg bg-white p-0.5 border border-line">
                  <button
                    onClick={() => setReaderStyle("picture-book")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      readerStyle === "picture-book"
                        ? "bg-forest text-white"
                        : "text-inkSoft hover:text-ink"
                    }`}
                  >
                    {t.story.viewModeBook || "Picture Book"}
                  </button>
                  <button
                    onClick={() => setReaderStyle("continuous")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      readerStyle === "continuous"
                        ? "bg-forest text-white"
                        : "text-inkSoft hover:text-ink"
                    }`}
                  >
                    {t.story.viewModeContinuous || "Continuous"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VIEW 1: INTERACTIVE RETELLING STUDIO */}
          {viewMode === "studio" && (
            <div className="space-y-6">
              {/* Practice Mode & Technique Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#F7ECD8]/50 border border-line">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-forestDark">Practice Mode:</span>
                  <div className="flex rounded-lg bg-white p-1 border border-line">
                    <button
                      onClick={() => setPracticeMode("prompt")}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        practiceMode === "prompt" ? "bg-forest text-white" : "text-inkSoft"
                      }`}
                    >
                      {t.story.modePrompt}
                    </button>
                    <button
                      onClick={() => setPracticeMode("fading")}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        practiceMode === "fading" ? "bg-forest text-white" : "text-inkSoft"
                      }`}
                    >
                      {t.story.modeFading}
                    </button>
                    <button
                      onClick={() => setPracticeMode("free")}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        practiceMode === "free" ? "bg-forest text-white" : "text-inkSoft"
                      }`}
                    >
                      {t.story.modeFree}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-forestDark">Art Technique:</span>
                  <select
                    value={selectedStory.defaultArtStyle}
                    onChange={(e) => handleChangeStoryStyle(e.target.value as WaldorfArtStyle)}
                    className="px-2.5 py-1 rounded-lg border border-line bg-white text-xs font-medium"
                  >
                    <option value="wet-on-wet">{t.story.styleWetOnWet}</option>
                    <option value="crayon">{t.story.styleCrayon}</option>
                    <option value="chalkboard">{t.story.styleChalkboard}</option>
                  </select>
                </div>
              </div>

              {/* SINGLE SCENE THEATER & PRACTICE STAGE */}
              <div className="garden-card space-y-5">
                {/* Unified Studio Stage Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-forest" />
                    <h2 className="font-serif text-lg font-bold text-forestDark">
                      {t.story.mergedStudioTitle || "Interactive Retelling Studio"}
                    </h2>
                    <span className="badge-leaf text-xs">
                      {t.story.sceneCounter} {activeSceneIndex + 1} {t.story.ofWord || "of"} {totalScenes}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleResegmentActiveStory}
                      disabled={isSegmenting}
                      className="btn-ghost text-xs py-1 text-forestDark hover:text-forest"
                      title={t.story.resegmentByContextBtn}
                    >
                      {isSegmenting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-terra" />
                      )}
                      <span>
                        {isSegmenting ? t.story.segmentingStatus : t.story.resegmentByContextBtn}
                      </span>
                    </button>

                    <button
                      onClick={handleGenerateAllScenesArt}
                      disabled={isGeneratingAllScenes}
                      className="btn-primary text-xs py-1"
                      title={t.story.generateAllArtBtn}
                    >
                      {isGeneratingAllScenes ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isGeneratingAllScenes ? "Painting all scenes..." : t.story.generateAllArtBtn}
                      </span>
                    </button>
                  </div>
                </div>

                {/* SCENE THEATER CAROUSEL (Touch Swipable & Clean Controls) */}
                {currentScene && (
                  <div
                    className="relative rounded-2xl bg-[#FFFDF9] border border-line p-4 sm:p-5 space-y-4 shadow-sm"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Scene Navigation Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevScene}
                          disabled={activeSceneIndex <= 0}
                          className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>{t.story.prevSceneBtn}</span>
                        </button>
                        <button
                          onClick={handleNextScene}
                          disabled={activeSceneIndex >= totalScenes - 1}
                          className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <span>{t.story.nextSceneBtn}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] text-inkSoft italic hidden sm:inline">
                        {t.story.swipeHint}
                      </span>

                      {/* Scene Stepper Indicator Dots */}
                      <div className="flex items-center gap-1.5">
                        {selectedStory.scenes.map((sc, idx) => (
                          <button
                            key={sc.id}
                            onClick={() => setActiveSceneIndex(idx)}
                            className={`transition-all rounded-full ${
                              idx === activeSceneIndex
                                ? "w-7 h-2 bg-forest shadow-sm"
                                : "w-2 h-2 bg-[#D5C7B0] hover:bg-forest/60"
                            }`}
                            title={`Scene ${idx + 1}: ${sc.title}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Single Artwork Card with Overlay Navigation Chevrons */}
                    {(() => {
                      const proceduralSvgUrl = ProceduralIllustrator.generateArtSVG(
                        currentScene,
                        currentScene.artStyle
                      );
                      const displayArtUrl = currentScene.imagePath || proceduralSvgUrl;
                      const isEditing = editingSceneId === currentScene.id;
                      const sanitizedKw = sanitizeKeywords(currentScene.keywords);

                      return (
                        <div className="space-y-4">
                          <div className="relative w-full max-w-2xl mx-auto aspect-[16/10] rounded-xl overflow-hidden border border-line bg-[#FDF8EE] shadow-md group">
                            <img
                              src={displayArtUrl}
                              alt={currentScene.title}
                              className="w-full h-full object-cover transition duration-300"
                            />

                            {/* Side Overlay Chevrons on Artwork */}
                            {activeSceneIndex > 0 && (
                              <button
                                onClick={handlePrevScene}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 hover:bg-white text-forestDark shadow-md transition backdrop-blur-sm opacity-80 group-hover:opacity-100"
                                title={t.story.prevSceneBtn}
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                            )}
                            {activeSceneIndex < totalScenes - 1 && (
                              <button
                                onClick={handleNextScene}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 hover:bg-white text-forestDark shadow-md transition backdrop-blur-sm opacity-80 group-hover:opacity-100"
                                title={t.story.nextSceneBtn}
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            )}

                            {/* Generating shimmer overlay */}
                            {currentScene.isGenerating && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                                <RefreshCw className="w-7 h-7 animate-spin text-amber-300" />
                                <span className="text-sm font-serif italic text-amber-100">
                                  {t.story.generatingArtStatus}
                                </span>
                              </div>
                            )}

                            {/* Top Action Buttons */}
                            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                              <button
                                onClick={() => handleGenerateSceneArt(currentScene.id)}
                                disabled={currentScene.isGenerating}
                                className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur shadow text-forest hover:bg-white transition text-xs flex items-center gap-1.5 font-semibold"
                                title={t.story.generateAiArtBtn}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-terra" />
                                <span className="hidden sm:inline text-xs">
                                  {t.story.generateAiArtBtn}
                                </span>
                              </button>
                              <button
                                onClick={() => handleRegenerateScene(currentScene.id)}
                                disabled={currentScene.isGenerating}
                                className="p-1.5 rounded-lg bg-white/95 backdrop-blur shadow text-forest hover:bg-white transition text-xs flex items-center gap-1"
                                title={t.story.regenerateArtBtn}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Accurate Attribution Badge */}
                            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-[11px] font-sans flex items-center gap-1.5 shadow">
                              <span className="font-bold tracking-wider">
                                {currentScene.artStyle.toUpperCase()}
                              </span>
                              <span>·</span>
                              <span className="opacity-90">
                                {currentScene.imagePath
                                  ? currentScene.imageSourceLabel || "AI Generated Art"
                                  : `Procedural Waldorf Art (${currentScene.artStyle})`}
                              </span>
                            </div>
                          </div>

                          {/* Scene Title, Context Summary & Inline Editing */}
                          {isEditing ? (
                            <div className="max-w-2xl mx-auto space-y-2.5 p-3.5 rounded-xl bg-white border border-line">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-line text-sm font-semibold"
                              />
                              <textarea
                                rows={3}
                                value={editSummary}
                                onChange={(e) => setEditSummary(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-line text-xs font-sans"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveSceneEdit(currentScene.id)}
                                  className="btn-primary text-xs py-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={() => setEditingSceneId(null)}
                                  className="btn-ghost text-xs py-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="max-w-2xl mx-auto space-y-2.5 p-4 rounded-xl bg-white/80 border border-line shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="font-serif font-bold text-base text-forestDark leading-snug">
                                  {currentScene.title}
                                </h4>
                                <button
                                  onClick={() => {
                                    setEditingSceneId(currentScene.id);
                                    setEditTitle(currentScene.title);
                                    setEditSummary(currentScene.summary);
                                  }}
                                  className="text-inkSoft hover:text-forest p-1 rounded hover:bg-[#F7ECD8]/50 transition"
                                  title="Edit scene summary"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Practice Mode text presentation */}
                              {practiceMode === "free" ? (
                                <div className="space-y-2 p-3 rounded-lg bg-[#F7ECD8]/40 border border-line/60">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs italic text-forestDark font-medium">
                                      ✨ Free practice mode: form living pictures in your imagination!
                                    </span>
                                    <button
                                      onClick={() => setIsFreePracticeRevealed(!isFreePracticeRevealed)}
                                      className="text-[11px] text-forest underline font-medium hover:text-terra"
                                    >
                                      {isFreePracticeRevealed ? "Hide prompt" : "Peek prompt"}
                                    </button>
                                  </div>
                                  {isFreePracticeRevealed && (
                                    <p className="text-xs text-ink leading-relaxed pt-1 border-t border-line/50 font-serif">
                                      {currentScene.summary}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p
                                  className={`text-xs text-ink leading-relaxed ${
                                    practiceMode === "fading" ? "fading select-none" : ""
                                  }`}
                                >
                                  {currentScene.summary}
                                </p>
                              )}

                              {/* Clean, Sanitized Keyword Tags */}
                              {sanitizedKw.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/40">
                                  <span className="text-[10px] uppercase font-semibold text-inkSoft tracking-wider mr-1">
                                    Sensory Cues:
                                  </span>
                                  {sanitizedKw.map((kw, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-full bg-[#F7ECD8] text-[10px] font-medium text-forestDark border border-line/60"
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* REIMAGINED FOCUSED RETELLING WORKSPACE */}
                <div className="rounded-2xl bg-white border border-line p-5 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-terra" />
                      <h3 className="font-serif font-bold text-sm text-forestDark">
                        {t.story.transcriptTitle || "Story Retelling & Oral Practice Workspace"}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isRecording
                            ? "bg-red-100 text-red-700 animate-pulse border border-red-200"
                            : speechSupported
                            ? "bg-[#E3EFE0] text-forest border border-[#BEDEBA]"
                            : "bg-[#F7ECD8] text-inkSoft"
                        }`}
                      >
                        {isRecording
                          ? "● Recording voice & listening..."
                          : speechSupported
                          ? "Live Dictation Ready"
                          : "Manual text mode"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsFullStoryOpen(true)}
                        className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5 text-forestDark hover:text-forest"
                        title={t.story.readFullStoryBtn || "Read Full Story"}
                      >
                        <Book className="w-3.5 h-3.5 text-forest" />
                        <span>{t.story.readFullStoryBtn || "Full Story Reference"}</span>
                      </button>

                      {transcript && (
                        <button
                          onClick={() => {
                            setTranscript("");
                            setRawTranscript("");
                            setInterimSpoken("");
                          }}
                          className="btn-ghost text-xs py-1 px-2 text-inkSoft hover:text-terra"
                          title={t.story.clearTranscriptBtn}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Transcript textarea with real-time speech feedback */}
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder={t.story.spokenTranscriptPlaceholder}
                      className="w-full p-3.5 rounded-xl border border-line bg-[#FDFBF7] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-forest/40 leading-relaxed resize-y"
                    />

                    {interimSpoken && (
                      <div className="p-2 rounded-lg bg-[#F7ECD8]/50 border border-line/60 flex items-center gap-2 text-xs text-terra animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-terra" />
                        <span className="italic font-medium">"{interimSpoken}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveCorrectionAndDialect}
                        disabled={!transcript.trim()}
                        className="btn-primary text-xs py-1.5 px-3.5 shadow-sm"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>{t.story.saveCorrectionBtn}</span>
                      </button>

                      {dialectNotice && (
                        <span className="text-xs font-semibold text-forest animate-fade-in">
                          ✓ {dialectNotice}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-inkSoft italic">
                      Save your retelling to preserve local dialect nuances and acoustic reflections.
                    </span>
                  </div>

                  {/* INTEGRATED DIRECT ACOUSTIC ANALYSIS (Reported right inside Retelling Workspace) */}
                  {audioMetrics && (
                    <div className="mt-4 pt-4 border-t border-line space-y-3 bg-[#E3EFE0]/40 -mx-5 -mb-5 p-5 rounded-b-2xl">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-forestDark flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-forest" />
                          {t.story.audioAnalysisTitle}
                        </h4>
                        {recordedAudioUrl && (
                          <audio controls src={recordedAudioUrl} className="h-7 w-36 sm:w-48" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        <div className="p-2.5 rounded-lg bg-white/90 border border-line">
                          <div className="text-[11px] text-inkSoft">{t.story.metricDuration}</div>
                          <div className="text-sm sm:text-base font-serif font-bold text-forestDark mt-0.5">
                            {audioMetrics.durationSeconds}s
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/90 border border-line">
                          <div className="text-[11px] text-inkSoft">{t.story.metricLoudness}</div>
                          <div className="text-sm sm:text-base font-serif font-bold text-forestDark mt-0.5">
                            {audioMetrics.rmsDecibels} dB
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/90 border border-line">
                          <div className="text-[11px] text-inkSoft">{t.story.metricDynamicRange}</div>
                          <div className="text-sm sm:text-base font-serif font-bold text-forestDark mt-0.5">
                            {audioMetrics.dynamicRangeDb} dB
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/90 border border-line">
                          <div className="text-[11px] text-inkSoft">{t.story.metricPauseRatio}</div>
                          <div className="text-sm sm:text-base font-serif font-bold text-forestDark mt-0.5">
                            {Math.round(audioMetrics.pauseRatio * 100)}%
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/90 border border-line">
                          <div className="text-[11px] text-inkSoft">{t.story.metricPace}</div>
                          <div className="text-sm sm:text-base font-serif font-bold text-forestDark mt-0.5">
                            {audioMetrics.estimatedPaceWPM} WPM
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-forestDark font-medium leading-relaxed italic">
                        {audioMetrics.deliverySummary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Privacy Consent Toggle */}
                <div className="p-3 rounded-xl bg-[#FFFDF7] border border-line flex items-start gap-3 text-xs">
                  <input
                    type="checkbox"
                    id="consent-toggle"
                    checked={consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                    className="mt-0.5 rounded text-forest focus:ring-forest"
                  />
                  <label htmlFor="consent-toggle" className="text-inkSoft cursor-pointer">
                    <strong className="text-forestDark">{t.story.consentLabel}</strong>
                    <p className="mt-0.5">{t.story.consentNotice}</p>
                  </label>
                </div>
              </div>

              {/* STEP 3: CONSTRUCTIVE STORYTELLING FEEDBACK */}
              <div className="garden-card space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h2 className="font-serif text-lg font-bold text-forestDark flex items-center gap-2">
                    <Heart className="w-5 h-5 text-terra" />
                    {t.story.feedbackTitle}
                  </h2>
                  <span className="text-xs text-inkSoft italic">
                    {t.story.noNumericGradingNotice}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FDFBF5] border border-line space-y-1">
                    <div className="font-semibold text-forestDark flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-forest" />
                      Rhythm & Breath Balance
                    </div>
                    <p className="text-inkSoft leading-relaxed">
                      Your spoken pace gives young listeners space to form living pictures in their mind's eye. Remember to breathe between key scene transitions.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FDFBF5] border border-line space-y-1">
                    <div className="font-semibold text-forestDark flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-terra" />
                      Imagery & Sensory Warmth
                    </div>
                    <p className="text-inkSoft leading-relaxed">
                      The sensory language of earth, water, and handmade craft grounds the story deeply in living imagination.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: AUTHENTIC WALDORF STORYBOOK READER */}
          {viewMode === "reader" && (
            <div className="space-y-6">
              {/* Storybook Reader Header Card */}
              <div className="garden-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                  <div>
                    <span className="badge-leaf text-xs mb-1">
                      {selectedStory.ageRange} · {selectedStory.defaultArtStyle.toUpperCase()}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-forestDark">
                      {activeStoryTitle}
                    </h2>
                    <p className="text-xs text-inkSoft mt-0.5">
                      {selectedStory.goal || "Imaginative storytelling & picture-making"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("studio")}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{t.story.jumpToStudioWithScene || "Practice in Studio"}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-view: 1. Picture Book Spread (Sách Tranh Lật Trang) */}
                {readerStyle === "picture-book" && currentScene && (
                  <div className="space-y-5 pt-2">
                    {/* Open Book Spread Container */}
                    <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#E7DCC4] p-5 sm:p-8 shadow-md">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Page: Large Waldorf Artwork */}
                        <div className="space-y-3">
                          <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden border border-line bg-[#FDF8EE] shadow-sm group">
                            {(() => {
                              const proceduralSvgUrl = ProceduralIllustrator.generateArtSVG(
                                currentScene,
                                currentScene.artStyle
                              );
                              const displayArtUrl = currentScene.imagePath || proceduralSvgUrl;

                              return (
                                <img
                                  src={displayArtUrl}
                                  alt={currentScene.title}
                                  className="w-full h-full object-cover"
                                />
                              );
                            })()}

                            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-[11px] font-sans">
                              {currentScene.artStyle.toUpperCase()} ·{" "}
                              {currentScene.imagePath
                                ? currentScene.imageSourceLabel || "AI Art"
                                : "Goethean Procedural Art"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-inkSoft px-1">
                            <span className="italic">
                              Illustration {activeSceneIndex + 1} of {totalScenes}
                            </span>
                            <span className="font-serif">
                              {selectedStory.defaultArtStyle === "wet-on-wet"
                                ? "Wet-on-Wet Watercolor"
                                : selectedStory.defaultArtStyle === "crayon"
                                ? "Beeswax Block Crayon"
                                : "Chalkboard Pastel"}
                            </span>
                          </div>
                        </div>

                        {/* Right Page: Story Text & Narrative */}
                        <div className="space-y-4 flex flex-col justify-between h-full">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-line pb-2">
                              <span className="text-xs uppercase tracking-wider font-semibold text-forest">
                                {t.story.pageCounter || "Page"} {activeSceneIndex + 1} / {totalScenes}
                              </span>
                              <span className="badge-sand text-[10px]">
                                Scene {currentScene.ord}
                              </span>
                            </div>

                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-forestDark leading-snug">
                              {currentScene.title}
                            </h3>

                            <div className="font-serif text-base sm:text-lg leading-relaxed text-ink space-y-3 pt-1">
                              <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-terra first-letter:mr-1.5 first-letter:float-left first-letter:leading-none">
                                {currentScene.summary}
                              </p>
                            </div>

                            {/* Sensory Cues Tags */}
                            {sanitizeKeywords(currentScene.keywords).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-3">
                                {sanitizeKeywords(currentScene.keywords).map((kw, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-0.5 rounded-full bg-[#F7ECD8] text-[11px] font-medium text-forestDark border border-line/60"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick Jump to Studio Action */}
                          <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
                            <button
                              onClick={() => {
                                setViewMode("studio");
                              }}
                              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-forest"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <span>{t.story.jumpToStudioWithScene || "Practice this scene in Studio"}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={handlePrevScene}
                                disabled={activeSceneIndex <= 0}
                                className="btn-ghost text-xs py-1 px-3 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Previous</span>
                              </button>
                              <button
                                onClick={handleNextScene}
                                disabled={activeSceneIndex >= totalScenes - 1}
                                className="btn-ghost text-xs py-1 px-3 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Book Page Turner Thumbnails */}
                    <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                      {selectedStory.scenes.map((sc, idx) => (
                        <button
                          key={sc.id}
                          onClick={() => setActiveSceneIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-serif transition flex items-center gap-1.5 border ${
                            idx === activeSceneIndex
                              ? "bg-forest text-white border-forest shadow-sm font-bold"
                              : "bg-white/80 text-forestDark border-line hover:bg-white"
                          }`}
                        >
                          <span>{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-view: 2. Continuous Prose (Đọc Liền Mạch Toàn Bộ Truyện) */}
                {readerStyle === "continuous" && (
                  <div className="max-w-3xl mx-auto space-y-6 pt-3 pb-8">
                    {/* Audio Player if available */}
                    {recordedAudioUrl && (
                      <div className="p-3.5 rounded-xl bg-[#E3EFE0]/60 border border-[#BEDEBA] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-forestDark">
                          <Volume2 className="w-4 h-4 text-forest" />
                          <span>Listen to your recorded oral retelling while reading:</span>
                        </div>
                        <audio controls src={recordedAudioUrl} className="h-8 w-48" />
                      </div>
                    )}

                    {/* Complete Story Text formatted as an illustrated book */}
                    <div className="bg-[#FFFDF7] p-6 sm:p-10 rounded-2xl border border-line shadow-sm space-y-6">
                      <div className="text-center space-y-1.5 border-b border-line pb-4">
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-forestDark">
                          {activeStoryTitle}
                        </h3>
                        <p className="text-xs text-inkSoft italic">
                          {selectedStory.sourceInfo || "Waldorf Storytelling Collection"}
                        </p>
                      </div>

                      {/* Continuous scenes with illustration vignettes */}
                      <div className="space-y-6 font-serif text-base sm:text-lg leading-relaxed text-ink">
                        {selectedStory.scenes.map((sc, idx) => {
                          const svgUrl = ProceduralIllustrator.generateArtSVG(sc, sc.artStyle);
                          const artUrl = sc.imagePath || svgUrl;

                          return (
                            <div key={sc.id} className="space-y-3 pt-3 border-t border-line/40 first:border-t-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-serif font-bold text-base text-forestDark">
                                  {sc.title}
                                </h4>
                                <button
                                  onClick={() => {
                                    setActiveSceneIndex(idx);
                                    setViewMode("studio");
                                  }}
                                  className="text-xs text-forest hover:text-terra font-sans font-medium"
                                >
                                  Practice in Studio →
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                <div className="sm:col-span-2">
                                  <p className="leading-relaxed whitespace-pre-line text-ink">
                                    {sc.summary}
                                  </p>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-line shadow-sm aspect-[16/10] group">
                                  <img
                                    src={artUrl}
                                    alt={sc.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Full Original Source Story Text Section */}
                      <div className="pt-6 border-t border-line space-y-3">
                        <h4 className="font-serif font-bold text-base text-forestDark flex items-center gap-2">
                          <FileText className="w-4 h-4 text-forest" />
                          Complete Narrative Text (Full Source)
                        </h4>
                        <div className="p-4 rounded-xl bg-[#FDFBF5] border border-line font-serif text-sm sm:text-base leading-relaxed text-ink whitespace-pre-line">
                          {activeStoryText}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE-OVER DRAWER: COMPLETE SOURCE STORY REFERENCE */}
          {isFullStoryOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
              <div
                className="w-full max-w-lg bg-[#FFFDF7] h-full shadow-2xl border-l border-line p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right"
                role="dialog"
                aria-modal="true"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-forest" />
                      <h3 className="font-serif font-bold text-base text-forestDark">
                        {t.story.fullStoryDrawerTitle || "Full Story Reference"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsFullStoryOpen(false)}
                      className="p-1.5 rounded-lg text-inkSoft hover:text-ink hover:bg-[#F7ECD8]/60 transition"
                      title={t.story.closeFullStoryBtn || "Close"}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-xl font-bold text-forestDark">
                      {activeStoryTitle}
                    </h4>
                    <p className="text-xs text-inkSoft">
                      {selectedStory.ageRange} · {selectedStory.goal}
                    </p>
                  </div>

                  {/* Active Scene Highlight Notice */}
                  {currentScene && (
                    <div className="p-3 rounded-lg bg-[#E3EFE0]/60 border border-[#BEDEBA] text-xs text-forestDark">
                      <strong>Current Active Scene {activeSceneIndex + 1}:</strong> {currentScene.title}
                    </div>
                  )}

                  {/* Complete story text */}
                  <div className="p-4 rounded-xl bg-white border border-line text-sm font-serif leading-relaxed text-ink whitespace-pre-line shadow-inner max-h-[60vh] overflow-y-auto">
                    {activeStoryText}
                  </div>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setIsFullStoryOpen(false);
                      setViewMode("reader");
                    }}
                    className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open in Storybook Reader</span>
                  </button>

                  <button
                    onClick={() => setIsFullStoryOpen(false)}
                    className="btn-ghost text-xs py-2 px-3"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PERSISTENT FLOATING VOICE RECORDING DOCK */}
          <aside
            aria-label="Story retelling quick recording bar"
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl bg-[#FFFDF7]/95 backdrop-blur-md border-2 border-forest/30 shadow-2xl rounded-2xl p-2.5 sm:px-5 flex items-center justify-between gap-3 transition-all"
          >
            {/* Scene Stepper in Dock */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevScene}
                disabled={activeSceneIndex <= 0}
                className="p-1.5 sm:p-2 rounded-lg bg-white/90 border border-line text-forestDark hover:bg-[#F7ECD8] disabled:opacity-30 disabled:pointer-events-none transition shadow-sm"
                title={t.story.prevSceneBtn}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center px-1">
                <div className="text-[11px] sm:text-xs font-serif font-bold text-forestDark whitespace-nowrap">
                  {t.story.sceneCounter} {activeSceneIndex + 1}/{totalScenes}
                </div>
              </div>
              <button
                onClick={handleNextScene}
                disabled={activeSceneIndex >= totalScenes - 1}
                className="p-1.5 sm:p-2 rounded-lg bg-white/90 border border-line text-forestDark hover:bg-[#F7ECD8] disabled:opacity-30 disabled:pointer-events-none transition shadow-sm"
                title={t.story.nextSceneBtn}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Read Full Story button in dock */}
            <button
              onClick={() => setIsFullStoryOpen(true)}
              className="p-2 rounded-lg bg-white/90 border border-line text-forestDark hover:bg-[#F7ECD8] transition shadow-sm hidden sm:flex items-center gap-1 text-xs"
              title={t.story.readFullStoryBtn || "Read Full Story"}
            >
              <Book className="w-3.5 h-3.5 text-forest" />
              <span>Full Story</span>
            </button>

            {/* Main Voice Recording Action Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-terra hover:bg-[#a84736] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition active:scale-95"
                >
                  <Mic className="w-4 h-4 text-white" />
                  <span className="font-semibold">{t.story.dockRecord || t.story.recordBtn}</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-md animate-pulse active:scale-95"
                >
                  <Square className="w-4 h-4 text-white fill-white" />
                  <span className="font-semibold">{t.story.dockStop || t.story.stopRecordBtn}</span>
                  <span className="font-mono text-xs bg-red-900/60 px-1.5 py-0.5 rounded ml-1">
                    {Math.floor(recordingDuration / 60)}:
                    {(recordingDuration % 60).toString().padStart(2, "0")}
                  </span>
                </button>
              )}

              {/* Compact Audio Playback if audio exists */}
              {recordedAudioUrl && !isRecording && (
                <audio controls src={recordedAudioUrl} className="h-8 w-24 sm:w-32" />
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
