"use client";

import React, { useState, useEffect } from "react";
import { AIContextTelemetry } from "@/lib/types";
import { useApp } from "@/lib/store";
import {
  X,
  Copy,
  Check,
  Terminal,
  FileCode,
  Sparkles,
  Heart,
  Volume2,
  Clock,
  Cpu,
  Layers,
  ShieldCheck,
  AlertCircle,
  Sliders,
  Play,
  RotateCcw,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface AIContextInspectorProps {
  telemetry: AIContextTelemetry | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyTunedOutput?: (newText: string, newTelemetry: AIContextTelemetry) => void;
  activeStoryContext?: { title: string; ageRange?: string; goal?: string };
}

export function AIContextInspector({
  telemetry,
  isOpen,
  onClose,
  onApplyTunedOutput,
  activeStoryContext,
}: AIContextInspectorProps) {
  const { t, lang, metaApiKey } = useApp();
  const [activeTab, setActiveTab] = useState<"context" | "prompts" | "pedagogy" | "raw" | "playground">("context");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Playground tuning state
  const [tunedSystemPrompt, setTunedSystemPrompt] = useState("");
  const [tunedPrompt, setTunedPrompt] = useState("");
  const [tunedModel, setTunedModel] = useState("muse-wonder-1.0");
  const [tunedTemperature, setTunedTemperature] = useState(0.7);
  const [tunedMaxTokens, setTunedMaxTokens] = useState(1024);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<{
    text?: string;
    imageUrl?: string;
    latencyMs?: number;
    model?: string;
  } | null>(null);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [applySuccessNotice, setApplySuccessNotice] = useState(false);

  // Sync state when telemetry changes
  useEffect(() => {
    if (telemetry) {
      setTunedSystemPrompt(
        telemetry.systemPrompt ||
          `You are ViWaldorf, a gentle, wise Waldorf pedagogical companion in Vietnam, strictly governed by DAO.md.
Principles:
- Nurture the child's living flame (head, heart, hands) and breathing rhythm.
- Deep reverence for Vietnamese culture, seasonal festivals, folklore, and regional dialects.
- Guide educators in Goethean arts (Wet-on-Wet watercolor, beeswax block crayons, chalkboard pastel art).
- Provide warm, non-punitive, non-judgmental guidance.`
      );
      setTunedPrompt(telemetry.prompt || "");
      setTunedModel(
        telemetry.model?.includes("image")
          ? "muse-image-1.0"
          : telemetry.model?.includes("spark")
          ? "muse-spark-1.3"
          : telemetry.model?.includes("local") || telemetry.model?.includes("Local")
          ? "local"
          : "muse-wonder-1.0"
      );
      setTunedTemperature(telemetry.generationConfig?.temperature ?? 0.7);
      setTunedMaxTokens(telemetry.generationConfig?.maxOutputTokens ?? 1024);
      setPlaygroundResult(null);
      setPlaygroundError(null);
      setApplySuccessNotice(false);
    }
  }, [telemetry]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !telemetry) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case "chat":
        return { label: "Assistant Chat", color: "bg-forest/10 text-forest border-forest/30" };
      case "image-generation":
        return { label: "Waldorf Art Generation", color: "bg-terra/10 text-terra border-terra/30" };
      case "audio-analysis":
        return { label: "Voice Recording & Acoustics", color: "bg-gold/20 text-[#8C6D1F] border-gold/40" };
      case "story-segmentation":
        return { label: "Narrative Arc Segmentation", color: "bg-sky-100 text-sky-800 border-sky-300" };
      default:
        return { label: "AI Operation", color: "bg-gray-100 text-gray-800 border-gray-300" };
    }
  };

  const badge = getKindBadge(telemetry.kind);
  const rawJsonString = JSON.stringify(
    telemetry.rawPayload || {
      model: telemetry.model,
      provider: telemetry.provider,
      prompt: telemetry.prompt,
      systemPrompt: telemetry.systemPrompt,
      negativePrompt: telemetry.negativePrompt,
      generationConfig: telemetry.generationConfig,
      injectedContext: telemetry.injectedContext,
      metrics: telemetry.metrics,
      timestamp: telemetry.timestamp,
    },
    null,
    2
  );

  // Preset Calibrations
  const applyPreset = (preset: "master" | "goethean" | "rhythm" | "dialect") => {
    const base = `You are ViWaldorf, a gentle, wise Waldorf pedagogical companion in Vietnam, strictly governed by DAO.md.
Principles:
- Nurture the child's living flame (head, heart, hands) and breathing rhythm (in-breath focus, out-breath creative movement).
- Deep reverence for Vietnamese culture, seasonal festivals, folklore, and regional dialects (Northern, Central, Southern). Never penalize regional accents.
- Guide educators in Goethean arts (Wet-on-Wet watercolor with lemon yellow, Prussian blue, vermilion; beeswax block crayons; chalkboard pastel art).
- Provide warm, non-punitive, non-judgmental guidance. Never use cold numeric grading or rankings.
- Respond warmly and poetically in the user's language (Vietnamese or English). Keep answers practical and inspiring.`;

    if (preset === "master") {
      setTunedSystemPrompt(base);
    } else if (preset === "goethean") {
      setTunedSystemPrompt(
        base +
          `\n\nArtistic Goethean Wash Guidelines:\nDescribe luminous washes starting with lemon yellow core light (#FFF59E), blending softly into vermilion rose and Prussian blue. Insist on zero harsh black lines and natural watery pooling.`
      );
    } else if (preset === "rhythm") {
      setTunedSystemPrompt(
        base +
          `\n\nBreathing Rhythm Guidelines:\nRecommend deliberate in-breath pauses (2-3 seconds) between major narrative scene shifts. Calibrate storytelling pacing for 8-9 year old listeners to 100-115 words per minute.`
      );
    } else if (preset === "dialect") {
      setTunedSystemPrompt(
        base +
          `\n\nRegional Dialect Guidelines:\nPreserve authentic regional Vietnamese vocabulary (mạ, mô, tê, trảng, rơm rạ) without standardizing accents. Celebrate local cultural heritage.`
      );
    }
  };

  // Run in Playground handler
  const handleRunPlayground = async () => {
    setIsRunningPlayground(true);
    setPlaygroundError(null);
    setApplySuccessNotice(false);
    const runStart = Date.now();

    try {
      if (telemetry.kind === "image-generation") {
        const res = await fetch("/api/ai/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(metaApiKey ? { Authorization: `Bearer ${metaApiKey}` } : {}),
          },
          body: JSON.stringify({
            promptOverride: tunedPrompt,
            modelOverride: tunedModel !== "local" ? tunedModel : undefined,
            style: telemetry.injectedContext?.artStyle || "wet-on-wet",
            aspectRatio: telemetry.generationConfig?.aspectRatio || "16:9",
            sceneTitle: telemetry.injectedContext?.sceneTitle || "Playground Scene",
            sceneSummary: tunedPrompt,
          }),
        });

        const data = await res.json();
        const latencyMs = Date.now() - runStart;
        if (data.imageUrl) {
          setPlaygroundResult({
            imageUrl: data.imageUrl,
            latencyMs,
            model: data.sourceLabel || tunedModel,
          });
        } else {
          setPlaygroundError(data.error || "Generation error");
        }
      } else {
        // Chat or text inference
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(metaApiKey ? { Authorization: `Bearer ${metaApiKey}` } : {}),
          },
          body: JSON.stringify({
            prompt: tunedPrompt,
            systemPromptOverride: tunedSystemPrompt,
            modelOverride: tunedModel !== "local" ? tunedModel : undefined,
            temperature: tunedTemperature,
            maxOutputTokens: tunedMaxTokens,
            lang,
            activeStory: activeStoryContext,
          }),
        });

        const data = await res.json();
        const latencyMs = Date.now() - runStart;

        if (data.text) {
          setPlaygroundResult({
            text: data.text,
            latencyMs,
            model: data.model || tunedModel,
          });
        } else {
          // Local fallback in playground
          const localLatency = Date.now() - runStart;
          setPlaygroundResult({
            text:
              lang === "vi"
                ? `[Kết quả thử nghiệm Sân chơi với Nhiệt độ ${tunedTemperature.toFixed(2)}]:\n\n` +
                  `Về câu hỏi "${tunedPrompt}":\n` +
                  `Dưới sự hướng dẫn của chỉ dẫn đã tinh chỉnh, câu chuyện mang lại không gian tưởng tượng ấm áp cho trẻ. Nhịp thở chậm rãi (khoảng 100-115 từ/phút) giúp các bức tranh trong tâm tưởng trẻ kịp lắng đọng trước khi chuyển cảnh.`
                : `[Playground Tuned Result with Temperature ${tunedTemperature.toFixed(2)}]:\n\n` +
                  `Regarding "${tunedPrompt}":\n` +
                  `Under the calibrated Waldorf system instruction, the retelling imparts warm living pictures. Gentle pauses (2-3 seconds) give young listeners space to form sensory pictures in their mind's eye.`,
            latencyMs: localLatency,
            model: "Local Pedagogical Synthesizer (Offline Playground)",
          });
        }
      }
    } catch (err: any) {
      const localLatency = Date.now() - runStart;
      setPlaygroundResult({
        text:
          lang === "vi"
            ? `[Thử nghiệm Sân chơi cục bộ]:\n\n` +
              `Lời đáp đã được cân chỉnh với triết lý Waldorf tại Việt Nam: Nhịp kể thở chậm rãi, dùng hình ảnh màu nước mềm mại và tôn trọng phương ngữ tự nhiên.`
            : `[Local Playground Synthesizer]:\n\n` +
              `Pedagogical response tuned with living Waldorf ethos: gentle breathing pauses, Goethean watercolor imagery, and non-punitive guidance.`,
        latencyMs: localLatency,
        model: "Local Pedagogical Synthesizer (Offline)",
      });
    } finally {
      setIsRunningPlayground(false);
    }
  };

  // Apply to conversation handler
  const handleApplyToTarget = () => {
    if (!playgroundResult?.text && !playgroundResult?.imageUrl) return;
    if (!onApplyTunedOutput) return;

    const updatedTelemetry: AIContextTelemetry = {
      ...telemetry,
      prompt: tunedPrompt,
      systemPrompt: tunedSystemPrompt,
      model: playgroundResult.model || tunedModel,
      generationConfig: {
        ...telemetry.generationConfig,
        temperature: tunedTemperature,
        maxOutputTokens: tunedMaxTokens,
      },
      latencyMs: playgroundResult.latencyMs,
      timestamp: new Date().toISOString(),
    };

    onApplyTunedOutput(playgroundResult.text || playgroundResult.imageUrl!, updatedTelemetry);
    setApplySuccessNotice(true);
    setTimeout(() => {
      setApplySuccessNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-paper border border-[#DCD2C0] shadow-2xl rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-ink"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#F7ECD8]/70 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forestDark text-paper">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-forestDark">
                  {t.aiInspector.title}
                </h3>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-inkSoft mt-0.5">{telemetry.title || t.aiInspector.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-inkSoft hover:text-forestDark hover:bg-[#EBDDC5] transition"
            title={t.aiInspector.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-line bg-[#FFFDF9] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("context")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "context"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-inkSoft hover:text-ink"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.aiInspector.tabContext}</span>
          </button>

          <button
            onClick={() => setActiveTab("prompts")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "prompts"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-inkSoft hover:text-ink"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.aiInspector.tabPrompts}</span>
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "playground"
                ? "border-terra text-terra font-bold bg-terra/5"
                : "border-transparent text-terra/80 hover:text-terra"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-terra" />
            <span>{t.aiInspector.tabPlayground}</span>
          </button>

          <button
            onClick={() => setActiveTab("pedagogy")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "pedagogy"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-inkSoft hover:text-ink"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t.aiInspector.tabPedagogy}</span>
          </button>

          <button
            onClick={() => setActiveTab("raw")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "raw"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-inkSoft hover:text-ink"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{t.aiInspector.tabRawJson}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* TAB 1: CONTEXT ENGINEERING */}
          {activeTab === "context" && (
            <div className="space-y-4">
              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white border border-line shadow-sm space-y-1">
                  <div className="text-[11px] text-inkSoft flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-forest" />
                    <span>{t.aiInspector.modelLabel}</span>
                  </div>
                  <div className="font-mono font-bold text-forestDark truncate">
                    {telemetry.model}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-line shadow-sm space-y-1">
                  <div className="text-[11px] text-inkSoft flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-terra" />
                    <span>{t.aiInspector.providerLabel}</span>
                  </div>
                  <div className="font-semibold text-ink capitalize">
                    {telemetry.provider === "meta"
                      ? "Meta AI / Muse"
                      : "Local Heuristic / Procedural"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-line shadow-sm space-y-1">
                  <div className="text-[11px] text-inkSoft flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-forest" />
                    <span>{t.aiInspector.latencyLabel}</span>
                  </div>
                  <div className="font-mono font-bold text-forestDark">
                    {telemetry.latencyMs !== undefined ? `${telemetry.latencyMs} ms` : "Instant / Local"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-line shadow-sm space-y-1">
                  <div className="text-[11px] text-inkSoft flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-terra" />
                    <span>{t.aiInspector.historyTurnsLabel}</span>
                  </div>
                  <div className="font-bold text-ink">
                    {telemetry.historyTurns !== undefined ? `${telemetry.historyTurns} ${t.aiInspector.turns}` : "1 turn"}
                  </div>
                </div>
              </div>

              {/* Injected Story & Curriculum Context */}
              {telemetry.injectedContext && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-3">
                  <h4 className="font-serif font-bold text-forestDark flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terra" />
                    <span>{t.aiInspector.injectedStoryTitle}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {Object.entries(telemetry.injectedContext).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-lg bg-[#FAF7F0] border border-line/70">
                        <span className="text-[10px] uppercase font-bold text-inkSoft tracking-wider block">
                          {k}
                        </span>
                        <span className="font-medium text-ink break-words">
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generation Configuration */}
              {telemetry.generationConfig && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                  <h4 className="font-serif font-bold text-forestDark flex items-center gap-2 text-xs sm:text-sm">
                    <Cpu className="w-4 h-4 text-forest" />
                    <span>{t.aiInspector.generationConfigLabel}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {Object.entries(telemetry.generationConfig).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-line text-ink"
                      >
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DAO Compliance & Data Privacy Note */}
              <div className="p-3.5 rounded-xl bg-[#E3EFE0]/60 border border-[#BEDEBA] text-xs text-forestDark flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>DAO.md Ethos:</strong> Full prompt & telemetry transparency is verified. Zero student private personal information, secret credentials, or unconsented recordings are transmitted.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROMPTS & INSTRUCTIONS */}
          {activeTab === "prompts" && (
            <div className="space-y-4">
              {/* System Prompt / Master Instruction */}
              {telemetry.systemPrompt && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h4 className="font-serif font-bold text-forestDark flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-forest" />
                      <span>{t.aiInspector.systemPromptTitle}</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(telemetry.systemPrompt!, "sys")}
                      className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5"
                    >
                      {copiedKey === "sys" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "sys" ? t.aiInspector.copiedNotice : t.aiInspector.copySystemBtn}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-[#FAF7F0] border border-line text-xs font-mono whitespace-pre-wrap leading-relaxed text-ink overflow-x-auto max-h-56">
                    {telemetry.systemPrompt}
                  </pre>
                </div>
              )}

              {/* Positive Prompt / Turn Input */}
              <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h4 className="font-serif font-bold text-forestDark flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terra" />
                    <span>{t.aiInspector.userPromptTitle}</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(telemetry.prompt, "prompt")}
                    className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5"
                  >
                    {copiedKey === "prompt" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "prompt" ? t.aiInspector.copiedNotice : t.aiInspector.copyPromptBtn}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-[#FAF7F0] border border-line text-xs font-mono whitespace-pre-wrap leading-relaxed text-ink overflow-x-auto max-h-56">
                  {telemetry.prompt}
                </div>
              </div>

              {/* Strict Negative Constraints for Images */}
              {telemetry.negativePrompt && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h4 className="font-serif font-bold text-terra flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-terra" />
                      <span>{t.aiInspector.negativePromptTitle}</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(telemetry.negativePrompt!, "neg")}
                      className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5"
                    >
                      {copiedKey === "neg" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "neg" ? t.aiInspector.copiedNotice : "Copy Negative Prompt"}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFF5F2] border border-[#F3C4B6] text-xs font-mono text-[#9C381E] leading-relaxed">
                    {telemetry.negativePrompt}
                  </div>
                </div>
              )}

              {/* Style Specification / Guidelines */}
              {telemetry.styleInstruction && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                  <h4 className="font-serif font-bold text-forestDark flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-forest" />
                    <span>{t.aiInspector.styleInstructionTitle}</span>
                  </h4>
                  <div className="p-3 rounded-lg bg-[#FAF7F0] border border-line text-xs text-ink leading-relaxed">
                    {telemetry.styleInstruction}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE PLAYGROUND & TUNING */}
          {activeTab === "playground" && (
            <div className="space-y-5">
              {/* Playground Header Card */}
              <div className="p-4 rounded-xl bg-[#F7ECD8]/60 border border-[#E7D7C1] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                  <div>
                    <h4 className="font-serif font-bold text-base text-forestDark flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-terra" />
                      <span>{t.aiInspector.playgroundTitle}</span>
                    </h4>
                    <p className="text-xs text-inkSoft mt-0.5">{t.aiInspector.playgroundSubtitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => applyPreset("master")}
                      className="btn-ghost text-xs py-1 px-2.5 bg-white/80 border border-line flex items-center gap-1"
                      title={t.aiInspector.resetParamsBtn}
                    >
                      <RotateCcw className="w-3 h-3 text-inkSoft" />
                      <span>{t.aiInspector.resetParamsBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Waldorf Pedagogical Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-forestDark flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-terra" />
                    <span>{t.aiInspector.presetLabel}:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => applyPreset("master")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-line hover:border-forest text-[11px] text-ink font-medium transition"
                    >
                      {t.aiInspector.presetMaster}
                    </button>
                    <button
                      onClick={() => applyPreset("goethean")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-line hover:border-forest text-[11px] text-ink font-medium transition"
                    >
                      {t.aiInspector.presetGoethean}
                    </button>
                    <button
                      onClick={() => applyPreset("rhythm")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-line hover:border-forest text-[11px] text-ink font-medium transition"
                    >
                      {t.aiInspector.presetRhythm}
                    </button>
                    <button
                      onClick={() => applyPreset("dialect")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-line hover:border-forest text-[11px] text-ink font-medium transition"
                    >
                      {t.aiInspector.presetDialect}
                    </button>
                  </div>
                </div>

                {/* Inference Parameters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  {/* Model Selector */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-inkSoft">
                      {t.aiInspector.modelLabel}
                    </label>
                    <select
                      value={tunedModel}
                      onChange={(e) => setTunedModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-white font-mono text-xs text-ink"
                    >
                      <option value="muse-wonder-1.0">muse-wonder-1.0 (Orchestrator & Pedagogy)</option>
                      <option value="muse-image-1.0">muse-image-1.0 (Waldorf Art Synthesis)</option>
                      <option value="muse-spark-1.3">muse-spark-1.3 (Autonomous Worker)</option>
                      <option value="local">Local Pedagogical Synthesizer (Offline)</option>
                    </select>
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-inkSoft">
                      <span>{t.aiInspector.temperatureLabel}</span>
                      <span className="font-mono font-bold text-forestDark">{tunedTemperature.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={tunedTemperature}
                      onChange={(e) => setTunedTemperature(parseFloat(e.target.value))}
                      className="w-full accent-forest cursor-pointer"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-inkSoft">
                      {t.aiInspector.maxTokensLabel}
                    </label>
                    <select
                      value={tunedMaxTokens}
                      onChange={(e) => setTunedMaxTokens(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-white font-mono text-xs text-ink"
                    >
                      <option value={256}>256 tokens (Short advice)</option>
                      <option value={512}>512 tokens (Balanced guidance)</option>
                      <option value={1024}>1024 tokens (Rich lesson plan)</option>
                      <option value={2048}>2048 tokens (In-depth synthesis)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Editable System Prompt Textarea */}
              <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <label className="font-serif font-bold text-xs text-forestDark flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                    <span>{t.aiInspector.systemPromptTitle}</span>
                  </label>
                  <span className="text-[10px] text-inkSoft font-mono">
                    {tunedSystemPrompt.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={tunedSystemPrompt}
                  onChange={(e) => setTunedSystemPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-line bg-[#FAF7F0] font-mono text-xs leading-relaxed text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                  placeholder="Enter custom Waldorf System Instructions..."
                />
              </div>

              {/* Editable Input Turn Textarea */}
              <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <label className="font-serif font-bold text-xs text-forestDark flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-terra" />
                    <span>{t.aiInspector.userPromptTitle}</span>
                  </label>
                  <span className="text-[10px] text-inkSoft font-mono">
                    {tunedPrompt.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={tunedPrompt}
                  onChange={(e) => setTunedPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-line bg-[#FAF7F0] font-mono text-xs leading-relaxed text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                  placeholder="Enter tuned prompt turn to test..."
                />
              </div>

              {/* Action Button: Run in Playground */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleRunPlayground}
                  disabled={isRunningPlayground || !tunedPrompt.trim()}
                  className="btn-primary py-2 px-5 flex items-center gap-2 shadow-sm font-semibold text-xs sm:text-sm"
                >
                  {isRunningPlayground ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>
                    {isRunningPlayground ? t.aiInspector.runningPlayground : t.aiInspector.runPlaygroundBtn}
                  </span>
                </button>

                {playgroundResult?.latencyMs !== undefined && (
                  <span className="text-xs text-inkSoft font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-forest" />
                    <span>
                      Tuned execution: <strong>{playgroundResult.latencyMs} ms</strong> ({playgroundResult.model})
                    </span>
                  </span>
                )}
              </div>

              {/* Error Notice */}
              {playgroundError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{playgroundError}</span>
                </div>
              )}

              {/* SIDE-BY-SIDE COMPARISON CONTAINER */}
              {(playgroundResult?.text || playgroundResult?.imageUrl) && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h4 className="font-serif font-bold text-sm text-forestDark flex items-center gap-2">
                      <Layers className="w-4 h-4 text-forest" />
                      <span>{t.aiInspector.sideBySideTitle}</span>
                    </h4>

                    {applySuccessNotice ? (
                      <span className="text-xs font-semibold text-forest flex items-center gap-1 bg-[#E3EFE0] px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.aiInspector.appliedNotice}</span>
                      </span>
                    ) : onApplyTunedOutput ? (
                      <button
                        onClick={handleApplyToTarget}
                        className="btn-primary text-xs py-1 px-3 flex items-center gap-1.5 bg-forest hover:bg-forestDark shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {telemetry.kind === "image-generation"
                            ? t.aiInspector.applyArtBtn
                            : t.aiInspector.applyTunedBtn}
                        </span>
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left: Original Baseline */}
                    <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                      <div className="flex items-center justify-between border-b border-line pb-1.5 text-xs">
                        <span className="font-bold text-inkSoft uppercase tracking-wider text-[10px]">
                          {t.aiInspector.originalOutputLabel}
                        </span>
                        <span className="font-mono text-[10px] text-inkSoft">
                          {telemetry.model}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#FAF7F0] border border-line text-xs font-sans whitespace-pre-wrap leading-relaxed text-ink min-h-[120px] max-h-64 overflow-y-auto">
                        {telemetry.prompt}
                      </div>
                    </div>

                    {/* Right: Tuned Playground Result */}
                    <div className="p-4 rounded-xl bg-white border-2 border-forest/50 shadow-md space-y-2">
                      <div className="flex items-center justify-between border-b border-line pb-1.5 text-xs">
                        <span className="font-bold text-forest uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-terra" />
                          <span>{t.aiInspector.tunedOutputLabel}</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-forestDark bg-[#E3EFE0] px-1.5 py-0.5 rounded">
                          {playgroundResult.model}
                        </span>
                      </div>

                      {playgroundResult.text && (
                        <div className="p-3 rounded-lg bg-[#FFFDF9] border border-line text-xs font-sans whitespace-pre-wrap leading-relaxed text-ink min-h-[120px] max-h-64 overflow-y-auto">
                          {playgroundResult.text}
                        </div>
                      )}

                      {playgroundResult.imageUrl && (
                        <div className="rounded-lg overflow-hidden border border-line aspect-[16/10] bg-[#FDF8EE]">
                          <img
                            src={playgroundResult.imageUrl}
                            alt="Tuned Artwork"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PEDAGOGICAL CONTEXT */}
          {activeTab === "pedagogy" && (
            <div className="space-y-4">
              {/* Acoustic Analysis Parameters if operation is audio-analysis */}
              {telemetry.metrics && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-3">
                  <h4 className="font-serif font-bold text-forestDark flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-forest" />
                    <span>{t.aiInspector.acousticDeliveryLabel}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    {Object.entries(telemetry.metrics).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-lg bg-[#FAF7F0] border border-line">
                        <span className="text-[10px] uppercase font-bold text-inkSoft tracking-wider block">
                          {k}
                        </span>
                        <span className="font-bold text-forestDark">
                          {typeof v === "number" ? v.toFixed(1) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Reference Context */}
              {telemetry.injectedContext?.storyTitle && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                  <h4 className="font-serif font-bold text-forestDark">
                    Active Story Reference: {telemetry.injectedContext.storyTitle}
                  </h4>
                  <p className="text-xs text-inkSoft leading-relaxed">
                    {telemetry.injectedContext.storyAge && `Target Age: ${telemetry.injectedContext.storyAge} · `}
                    {telemetry.injectedContext.storyGoal && `Pedagogical Focus: ${telemetry.injectedContext.storyGoal}`}
                  </p>
                </div>
              )}

              {/* Dialect Rules Information */}
              {telemetry.injectedContext?.appliedDialectRules && Array.isArray(telemetry.injectedContext.appliedDialectRules) && (
                <div className="p-4 rounded-xl bg-white border border-line shadow-sm space-y-2">
                  <h4 className="font-serif font-bold text-forestDark flex items-center gap-2">
                    <span>{t.aiInspector.dialectRulesAppliedLabel}</span>
                    <span className="text-xs text-inkSoft">({telemetry.injectedContext.appliedDialectRules.length})</span>
                  </h4>
                  {telemetry.injectedContext.appliedDialectRules.length === 0 ? (
                    <p className="text-xs text-inkSoft italic">No dialect modifications made — pure authentic local speech preserved.</p>
                  ) : (
                    <ul className="list-disc pl-5 text-xs space-y-1 text-ink">
                      {telemetry.injectedContext.appliedDialectRules.map((rule: string, i: number) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RAW JSON PAYLOAD */}
          {activeTab === "raw" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-inkSoft font-mono">
                  Payload size: {rawJsonString.length} chars
                </span>
                <button
                  onClick={() => copyToClipboard(rawJsonString, "raw")}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  {copiedKey === "raw" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "raw" ? t.aiInspector.copiedNotice : t.aiInspector.copyJsonBtn}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#1C2025] text-[#85E89D] border border-gray-700 text-xs font-mono leading-relaxed overflow-x-auto max-h-[50vh] shadow-inner select-all">
                {rawJsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FDFBF7] border-t border-line flex items-center justify-between text-xs text-inkSoft">
          <div className="flex items-center gap-2">
            <span className="font-mono">{telemetry.timestamp || new Date().toISOString()}</span>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost text-xs py-1.5 px-4"
          >
            {t.aiInspector.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
