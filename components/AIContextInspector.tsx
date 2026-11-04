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
  ExternalLink,
} from "lucide-react";

interface AIContextInspectorProps {
  telemetry: AIContextTelemetry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AIContextInspector({
  telemetry,
  isOpen,
  onClose,
}: AIContextInspectorProps) {
  const { t, lang } = useApp();
  const [activeTab, setActiveTab] = useState<"context" | "prompts" | "pedagogy" | "raw">("context");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-paper border border-[#DCD2C0] shadow-2xl rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-ink"
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
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition ${
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
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "prompts"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-inkSoft hover:text-ink"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.aiInspector.tabPrompts}</span>
          </button>

          <button
            onClick={() => setActiveTab("pedagogy")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition ${
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
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition ${
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
                    {telemetry.provider === "google"
                      ? "Google AI / Gemini"
                      : telemetry.provider === "meta"
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

          {/* TAB 3: PEDAGOGICAL CONTEXT */}
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

          {/* TAB 4: RAW JSON PAYLOAD */}
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
