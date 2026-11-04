"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { DemoBanner, PageHeader } from "@/components/PageHeader";
import { WaldorfArtStyle, StoryScene, AudioDeliveryMetrics, PracticeAttempt } from "@/lib/types";
import { ProceduralIllustrator } from "@/lib/art/proceduralIllustrator";
import { WavAnalyzer } from "@/lib/audio/wavAnalyzer";
import { DialectAdaptationEngine } from "@/lib/dialect/dialectEngine";
import { ModelGateway } from "@/lib/ai/modelGateway";
import {
  BookOpen,
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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

  // Mode and form states
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

  // When active story changes, reset retelling state cleanly (DO NOT dump story source text into retelling transcript!)
  useEffect(() => {
    if (selectedStory) {
      setTranscript("");
      setRawTranscript("");
      setInterimSpoken("");
      setRecordedAudioUrl(null);
      setAudioMetrics(null);
      setActiveSceneIndex(0);
    }
  }, [selectedStory?.id]);

  // Clean up recording interval on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  // Generate AI artwork for a single scene
  const handleGenerateSceneArt = async (sceneId: string) => {
    if (!selectedStory) return;
    const targetScene = selectedStory.scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    // Set generating status
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

  // Generate artwork for all scenes in active story
  const handleGenerateAllScenesArt = async () => {
    if (!selectedStory || isGeneratingAllScenes) return;
    setIsGeneratingAllScenes(true);

    for (const scene of selectedStory.scenes) {
      await handleGenerateSceneArt(scene.id);
    }

    setIsGeneratingAllScenes(false);
  };

  // Handle Manual Story Submission & Context-Aware Semantic Scene Splitting
  const handleSaveUploadedStory = async () => {
    if (!uploadText.trim() || isSegmenting) return;
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

    // If auto-generation is enabled and an API key is available, generate artwork asynchronously
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

  // Re-segment currently selected story using narrative context analysis
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

  // Keyboard left/right arrow navigation
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalScenes, activeSceneIndex]);

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
          scenes: s.scenes.map((sc) => ({ ...sc, artStyle: newStyle })),
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

  return (
    <div className="space-y-6 pb-28">
      <DemoBanner />

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

        <div className="mt-3 text-xs text-inkSoft">
          {data.attempts.length} {t.story.statsInfo} · {data.dialectRules.length} rules
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
          {/* Practice Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#F7ECD8]/60 border border-line">
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

            {/* Art Style Selector for whole story */}
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

          {/* MERGED STEP 1 & 2: INTERACTIVE STORY RETELLING STUDIO */}
          <div className="garden-card space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-forest" />
                <h2 className="font-serif text-lg font-bold text-forestDark">
                  {t.story.mergedStudioTitle || "Interactive Retelling Studio: Scene Journey & Voice Recording"}
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

            {/* SINGLE SCENE THEATER CAROUSEL (Touch Swipable & Button Controllable) */}
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
                            <span className="hidden sm:inline text-xs">{t.story.generateAiArtBtn}</span>
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

                        {/* Attribution Badge */}
                        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-[11px] font-sans flex items-center gap-1.5">
                          <span className="font-bold">{currentScene.artStyle.toUpperCase()}</span>
                          <span>·</span>
                          <span className="opacity-90">
                            {currentScene.imageSourceLabel || "Procedural Art"}
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
                        <div className="max-w-2xl mx-auto space-y-2 p-3.5 rounded-xl bg-white/70 border border-line">
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
                              className="text-inkSoft hover:text-forest p-1 rounded hover:bg-[#F7ECD8]/50"
                              title="Edit scene summary"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p
                            className={`text-xs text-ink leading-relaxed ${
                              practiceMode === "fading" ? "fading" : ""
                            }`}
                          >
                            {currentScene.summary}
                          </p>
                          {currentScene.keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {currentScene.keywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-[#F7ECD8]/70 text-[10px] font-medium text-forestDark"
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

            {/* DIRECT ACOUSTIC ANALYSIS METRICS (if recorded) */}
            {audioMetrics && (
              <div className="p-4 rounded-xl bg-[#E3EFE0]/70 border border-[#BEDEBA] space-y-3">
                <h4 className="font-serif font-bold text-sm text-forestDark flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-forest" />
                  {t.story.audioAnalysisTitle}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-2.5 rounded-lg bg-white/80 border border-line">
                    <div className="text-[11px] text-inkSoft">{t.story.metricDuration}</div>
                    <div className="text-base font-serif font-bold text-forestDark mt-0.5">
                      {audioMetrics.durationSeconds}s
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-line">
                    <div className="text-[11px] text-inkSoft">{t.story.metricLoudness}</div>
                    <div className="text-base font-serif font-bold text-forestDark mt-0.5">
                      {audioMetrics.rmsDecibels} dB
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-line">
                    <div className="text-[11px] text-inkSoft">{t.story.metricDynamicRange}</div>
                    <div className="text-base font-serif font-bold text-forestDark mt-0.5">
                      {audioMetrics.dynamicRangeDb} dB
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-line">
                    <div className="text-[11px] text-inkSoft">{t.story.metricPauseRatio}</div>
                    <div className="text-base font-serif font-bold text-forestDark mt-0.5">
                      {Math.round(audioMetrics.pauseRatio * 100)}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-line">
                    <div className="text-[11px] text-inkSoft">{t.story.metricPace}</div>
                    <div className="text-base font-serif font-bold text-forestDark mt-0.5">
                      {audioMetrics.estimatedPaceWPM} WPM
                    </div>
                  </div>
                </div>

                <p className="text-xs text-forestDark font-medium leading-relaxed italic">
                  {audioMetrics.deliverySummary}
                </p>
              </div>
            )}

            {/* DECOUPLED PANELS: LEFT = SOURCE STORY REFERENCE PROMPT; RIGHT = LIVE ORAL RETELLING TRANSCRIPT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              {/* SOURCE REFERENCE PROMPT */}
              <div className="p-4 rounded-xl bg-[#FFFDF9] border border-line space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <span className="text-xs font-semibold text-forestDark flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-forest" />
                      {t.story.sourceStoryReference}
                    </span>
                    <span className="badge-leaf text-[10px]">
                      {practiceMode.toUpperCase()}
                    </span>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto pr-1 text-xs text-ink leading-relaxed">
                    {practiceMode === "free" ? (
                      <div className="space-y-2 italic text-inkSoft">
                        <p>✨ Free practice mode: rely on your inner imagination!</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedStory.scenes.flatMap((s) => s.keywords).map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-[#F7ECD8] text-[11px] font-medium text-forestDark"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`font-serif whitespace-pre-line text-ink leading-relaxed ${
                          practiceMode === "fading" ? "fading" : ""
                        }`}
                      >
                        {lang === "vi" && selectedStory.sourceTextVi
                          ? selectedStory.sourceTextVi
                          : selectedStory.sourceText}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-line text-[11px] text-inkSoft italic">
                  {practiceMode === "prompt" && "Read aloud or use as a prompt while telling the story."}
                  {practiceMode === "fading" && "Text is gently faded to encourage mental picture recall."}
                  {practiceMode === "free" && "Tell the story freely in your own living words."}
                </div>
              </div>

              {/* LIVE ORAL RETELLING TRANSCRIPT */}
              <div className="p-4 rounded-xl bg-white border border-line space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <span className="text-xs font-semibold text-forestDark flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-terra" />
                      {t.story.transcriptTitle}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        speechSupported ? "bg-[#E3EFE0] text-forest" : "bg-[#F7ECD8] text-inkSoft"
                      }`}
                    >
                      {speechSupported
                        ? isRecording
                          ? "● Listening live..."
                          : "Live Dictation Ready"
                        : "Manual edit mode"}
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={t.story.spokenTranscriptPlaceholder}
                    className="w-full p-2.5 rounded-lg border border-line bg-[#FDFBF7] text-xs font-sans focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed resize-none"
                  />

                  {interimSpoken && (
                    <p className="text-[11px] text-terra italic animate-pulse">
                      "{interimSpoken}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveCorrectionAndDialect}
                      disabled={!transcript.trim()}
                      className="btn-primary text-xs py-1"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>{t.story.saveCorrectionBtn}</span>
                    </button>

                    {transcript && (
                      <button
                        onClick={() => {
                          setTranscript("");
                          setRawTranscript("");
                          setInterimSpoken("");
                        }}
                        className="btn-ghost text-xs py-1 text-inkSoft hover:text-terra"
                        title={t.story.clearTranscriptBtn}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t.story.clearTranscriptBtn}</span>
                      </button>
                    )}
                  </div>

                  {dialectNotice && (
                    <span className="text-xs font-semibold text-forest animate-fade-in">
                      ✓ {dialectNotice}
                    </span>
                  )}
                </div>
              </div>
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
                  The sensory language of river water, pottery clay, and wooden benches grounds the story deeply in Vietnamese cultural life.
                </p>
              </div>
            </div>
          </div>

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
                <audio controls src={recordedAudioUrl} className="h-8 w-28 sm:w-36" />
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
