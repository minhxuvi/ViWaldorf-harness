"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { DemoBanner, PageHeader } from "@/components/PageHeader";
import { WaldorfArtStyle, StoryScene, AudioDeliveryMetrics, PracticeAttempt } from "@/lib/types";
import { ProceduralIllustrator } from "@/lib/art/proceduralIllustrator";
import { WavAnalyzer } from "@/lib/audio/wavAnalyzer";
import { DialectAdaptationEngine } from "@/lib/dialect/dialectEngine";
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
  ShieldAlert,
  Brain,
  Heart,
  Eye,
  Wind,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function StoryPage() {
  const { data, updateData, selectedStory, setSelectedStoryId, t, lang } = useApp();

  // Mode and form states
  const [practiceMode, setPracticeMode] = useState<"prompt" | "fading" | "free">("prompt");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAge, setUploadAge] = useState("8–9");
  const [uploadStyle, setUploadStyle] = useState<WaldorfArtStyle>("wet-on-wet");
  const [uploadGoal, setUploadGoal] = useState("Warm, imagery-rich oral retelling");
  const [uploadText, setUploadText] = useState("");

  // Scene editing state
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioMetrics, setAudioMetrics] = useState<AudioDeliveryMetrics | null>(null);
  const [transcript, setTranscript] = useState("");
  const [rawTranscript, setRawTranscript] = useState("");
  const [consentGranted, setConsentGranted] = useState(false);
  const [dialectNotice, setDialectNotice] = useState("");

  // Refs for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial transcript with active story text
  useEffect(() => {
    if (selectedStory) {
      setTranscript(lang === "vi" && selectedStory.sourceTextVi ? selectedStory.sourceTextVi : selectedStory.sourceText);
      setRawTranscript("");
      setRecordedAudioUrl(null);
      setAudioMetrics(null);
    }
  }, [selectedStory?.id, lang]);

  // Handle Manual Story Submission & Auto Scene Splitting
  const handleSaveUploadedStory = () => {
    if (!uploadText.trim()) return;

    const title = uploadTitle.trim() || uploadText.trim().split("\n")[0].substring(0, 40) + "...";
    const paragraphs = uploadText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, 8);

    const generatedScenes: StoryScene[] = paragraphs.map((para, idx) => {
      const sceneTitle = `Scene ${idx + 1}: ${para.substring(0, 45)}...`;
      const words = para.split(/\s+/).slice(0, 4);
      return {
        id: `scene-${Date.now()}-${idx}`,
        ord: idx + 1,
        title: sceneTitle,
        summary: para,
        keywords: words,
        artStyle: uploadStyle,
        imagePrompt: `Waldorf illustration (${uploadStyle}) of ${para.substring(0, 80)}, soft organic colors`,
        imageSourceLabel: `Procedural Art (${uploadStyle})`,
      };
    });

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
    setShowUploadForm(false);
    setUploadTitle("");
    setUploadText("");
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
          scenes: s.scenes.map((sc) => ({ ...sc, artStyle: newStyle })),
        };
      }),
    }));
  };

  // Regenerate individual scene artwork
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
              imagePath: null, // Forces regeneration
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

  // Start In-Browser Audio Recording (Web Audio API)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        // Perform direct acoustic analysis
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const metrics = WavAnalyzer.analyzeAudioBuffer(audioBuffer, transcript);
          setAudioMetrics(metrics);

          // Save attempt
          if (selectedStory) {
            const attempt: PracticeAttempt = {
              id: `attempt-${Date.now()}`,
              storyId: selectedStory.id,
              mode: practiceMode,
              rawTranscript: transcript,
              transcript,
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
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required to record speech.");
    }
  };

  const stopRecording = () => {
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
    <div className="space-y-6">
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

          {/* STEP 1: SCENE MAP & 3 WALDORF ART TECHNIQUES */}
          <div className="garden-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h2 className="font-serif text-lg font-bold text-forestDark flex items-center gap-2">
                <Layers className="w-5 h-5 text-forest" />
                {t.story.step1Title}
              </h2>
              <span className="badge-leaf text-xs">
                {selectedStory.scenes.length} Scenes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStory.scenes.map((scene) => {
                const artSvgUrl = ProceduralIllustrator.generateArtSVG(scene, scene.artStyle);
                const isEditing = editingSceneId === scene.id;

                return (
                  <div
                    key={scene.id}
                    className="p-3.5 rounded-xl border border-line bg-[#FFFDF9] space-y-3 shadow-sm hover:shadow transition"
                  >
                    {/* Rendered Artwork */}
                    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-line bg-[#FDF8EE]">
                      <img
                        src={artSvgUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => handleRegenerateScene(scene.id)}
                          className="p-1.5 rounded-lg bg-white/90 backdrop-blur shadow text-forest hover:bg-white transition text-xs flex items-center gap-1"
                          title={t.story.regenerateArtBtn}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/40 backdrop-blur text-white text-[10px] font-sans">
                        {scene.artStyle.toUpperCase()}
                      </div>
                    </div>

                    {/* Scene Details */}
                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-line text-xs font-semibold"
                        />
                        <textarea
                          rows={2}
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-line text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveSceneEdit(scene.id)}
                            className="btn-primary text-xs py-1"
                          >
                            <Check className="w-3 h-3" />
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
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif font-bold text-sm text-forestDark leading-snug">
                            {scene.title}
                          </h4>
                          <button
                            onClick={() => {
                              setEditingSceneId(scene.id);
                              setEditTitle(scene.title);
                              setEditSummary(scene.summary);
                            }}
                            className="text-inkSoft hover:text-forest p-1"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p
                          className={`text-xs text-inkSoft leading-relaxed ${
                            practiceMode === "fading" ? "fading" : ""
                          }`}
                        >
                          {scene.summary}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: VOICE RECORDING, DIRECT ACOUSTIC ANALYSIS & DIALECT LEARNING */}
          <div className="garden-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h2 className="font-serif text-lg font-bold text-forestDark flex items-center gap-2">
                <Mic className="w-5 h-5 text-terra" />
                {t.story.step2Title}
              </h2>
            </div>

            {/* Recording Controls */}
            <div className="p-4 rounded-xl bg-[#F7ECD8]/50 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="btn-primary bg-terra hover:bg-[#a84736] border-terra"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{t.story.recordBtn}</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="btn-primary bg-red-700 hover:bg-red-800 border-red-700 animate-pulse"
                  >
                    <Square className="w-4 h-4" />
                    <span>{t.story.stopRecordBtn}</span>
                  </button>
                )}

                {recordedAudioUrl && (
                  <audio controls src={recordedAudioUrl} className="h-9 max-w-xs" />
                )}
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 text-xs font-semibold text-terra animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-terra" />
                  <span>{t.story.recordingInProgress}</span>
                </div>
              )}
            </div>

            {/* Direct Acoustic Analysis Metrics */}
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

            {/* Transcript & Dialect Learning */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-forestDark">
                {t.story.transcriptTitle}
              </label>
              <textarea
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full p-3 rounded-lg border border-line bg-white text-sm"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  onClick={handleSaveCorrectionAndDialect}
                  className="btn-primary text-xs"
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
        </div>
      )}
    </div>
  );
}
