"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { AIContextInspector } from "@/components/AIContextInspector";
import { ChatMessage, AIContextTelemetry } from "@/lib/types";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Terminal,
  Code2,
  Clock,
  Cpu,
  Layers,
  Eye,
  Sliders,
} from "lucide-react";

export default function ChatPage() {
  const { data, t, lang, selectedStory, metaApiKey, aiProvider } = useApp();

  const initialGreetingContext: AIContextTelemetry = {
    kind: "chat",
    title: "ViWaldorf Assistant Initial Session Greeting",
    prompt: "[System Initializer: Greet educator and offer storytelling & Goethean art guidance]",
    systemPrompt: `You are ViWaldorf, a gentle, wise Waldorf pedagogical companion in Vietnam, strictly governed by DAO.md.
Principles:
- Nurture the child's living flame (head, heart, hands) and breathing rhythm (in-breath focus, out-breath creative movement).
- Deep reverence for Vietnamese culture, seasonal festivals, folklore, and regional dialects (Northern, Central, Southern). Never penalize regional accents.
- Guide educators in Goethean arts (Wet-on-Wet watercolor with lemon yellow, Prussian blue, vermilion; beeswax block crayons; chalkboard pastel art).
- Provide warm, non-punitive, non-judgmental guidance. Never use cold numeric grading or rankings.
- Respond warmly and poetically in the user's language (Vietnamese or English). Keep answers practical and inspiring.`,
    model: "ViWaldorf Persona Initializer (DAO.md Compass)",
    provider: "local",
    historyTurns: 0,
    injectedContext: {
      language: lang,
      activeStory: selectedStory?.title || "Hội An Story",
      dialectRulesCount: data.dialectRules?.length || 0,
      governance: "DAO.md",
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
    rawPayload: {
      session: "initialized",
      welcomeTurn: 0,
      defaultStoryId: selectedStory?.id,
    },
    latencyMs: 15,
    timestamp: new Date().toISOString(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-0",
      sender: "viwaldorf",
      text:
        lang === "vi"
          ? "Chào bạn! Mình là trợ lý ViWaldorf. Mình có thể giúp bạn chuẩn bị bài kể chuyện, gợi ý cách vẽ tranh Wet-on-Wet hay Crayon, hoặc cùng xem lại nhịp tuần lớp học. Bạn muốn bắt đầu từ việc nào?"
          : "Warm greetings! I am your ViWaldorf assistant. I can help you prepare oral storytelling, suggest Wet-on-Wet or Crayon painting exercises, or review your weekly rhythm. Where shall we begin?",
      contextInfo: initialGreetingContext,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<"compact" | "expanded">("compact");

  // Telemetry modal inspector state
  const [selectedTelemetry, setSelectedTelemetry] = useState<AIContextTelemetry | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const handleOpenInspector = (msg: ChatMessage) => {
    if (!msg.contextInfo) return;
    setSelectedMessageId(msg.id);
    setSelectedTelemetry(msg.contextInfo);
    setIsInspectorOpen(true);
  };

  const handleApplyTunedOutput = (newText: string, newTelemetry: AIContextTelemetry) => {
    if (!selectedMessageId) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMessageId
          ? {
              ...m,
              text: newText,
              contextInfo: newTelemetry,
            }
          : m
      )
    );
  };

  const suggestions = [
    lang === "vi"
      ? "Gợi ý cách vẽ tranh Wet-on-Wet, Crayon và Chalkboard cho các cảnh truyện đang luyện"
      : "Suggest Wet-on-Wet, Crayon, and Chalkboard techniques for the active story scenes",
    lang === "vi"
      ? "Làm thế nào để nhịp thở của người kể truyền cảm xúc ấm áp cho trẻ 8-9 tuổi?"
      : "How can the storyteller's breathing rhythm impart warmth to 8-9 year old children?",
    lang === "vi"
      ? "Ý tưởng kết nối phiên chợ Hội An với bài học hoán đổi công bằng và đo lường"
      : "Ideas for connecting the Hội An market story with fair trade and practical measurement",
    lang === "vi"
      ? "Cách bảo tồn phương ngữ vùng miền mà không tạo áp lực chuẩn hóa lên học sinh"
      : "How to preserve regional dialects without imposing standardization pressure",
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isRunning) return;

    const currentTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // User Message Telemetry
    const userTelemetry: AIContextTelemetry = {
      kind: "chat",
      title: `User Prompt (Turn ${messages.length + 1})`,
      prompt,
      model: "Client Input Turn",
      provider: "local",
      historyTurns: messages.length,
      injectedContext: {
        language: lang,
        ...(selectedStory ? { storyTitle: selectedStory.title, storyAge: selectedStory.ageRange } : {}),
      },
      rawPayload: {
        role: "user",
        parts: [{ text: prompt }],
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: prompt,
      contextInfo: userTelemetry,
      timestamp: currentTimestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsRunning(true);

    const callStartTime = Date.now();

    // Attempt real Meta AI call if configured
    if (aiProvider === "meta" || metaApiKey) {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(metaApiKey ? { Authorization: `Bearer ${metaApiKey}` } : {}),
          },
          body: JSON.stringify({
            prompt,
            history: messages,
            lang,
            activeStory: selectedStory
              ? {
                  title: selectedStory.title,
                  ageRange: selectedStory.ageRange,
                  goal: selectedStory.goal,
                }
              : undefined,
            dialectCount: data.dialectRules?.length || 0,
          }),
        });

        if (res.ok) {
          const dataRes = await res.json();
          if (dataRes.text) {
            setMessages((prev) => [
              ...prev,
              {
                id: `b-${Date.now()}`,
                sender: "viwaldorf",
                text: dataRes.text,
                contextInfo: dataRes.contextInfo,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
            setIsRunning(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Meta AI chat fetch error, falling back to local heuristics:", err);
      }
    }

    // Pedagogical response synthesis fallback (offline or local heuristics)
    setTimeout(() => {
      let reply = "";
      const lower = prompt.toLowerCase();
      let matchedTheme = "general";

      if (
        lower.includes("wet-on-wet") ||
        lower.includes("vẽ") ||
        lower.includes("art") ||
        lower.includes("crayon")
      ) {
        matchedTheme = "arts";
        reply =
          lang === "vi"
            ? `Về nghệ thuật cho truyện "${selectedStory?.title || "Vườn học"}":
1. **Màu nước ướt-trên-ướt (Wet-on-Wet)**: Cho cảnh bến sông Thu Bồn, hãy bắt đầu bằng vạt vàng chanh ấm ở trung tâm, sau đó đưa xanh lam phổ tràn vào từ rìa giấy ẩm. Hai màu gặp nhau sẽ sinh ra sắc xanh non tự nhiên của bờ bãi mà không cần viền sắc cạnh.
2. **Sáp ong khối (Beeswax Crayon)**: Dùng cạnh phẳng của thỏi sáp màu đất son (terracotta) và nâu đất để vẽ chiếc ghế gỗ Kim Bồng. Chồng nhẹ lớp vàng ấm lên trên để tạo vân gỗ óng ả.
3. **Phấn bảng đen (Chalkboard)**: Vẽ những chuỗi đồng xu và đèn lồng Hội An tỏa ánh sáng vàng rực rỡ từ nền tối mờ của bảng đá đen.`
            : `Artistic guidance for "${selectedStory?.title || "Class Story"}":
1. **Wet-on-Wet Watercolor**: For the river estuary scene, begin with a gentle luminous wash of lemon yellow in the center, allowing Prussian blue to sweep in from the damp paper edges. Their soft meeting naturally births fresh leaf green shores without harsh outlines.
2. **Beeswax Block Crayon**: Use the flat broad edge of terracotta and ochre wax blocks for the carpenter's wooden bench, layering golden warmth over earth tones.
3. **Chalkboard Pastel**: Render the Hội An lantern reflections and ancient coins with glowing golden chalks against the deep matte slate blackboard.`;
      } else if (
        lower.includes("breath") ||
        lower.includes("thở") ||
        lower.includes("rhythm") ||
        lower.includes("nhịp")
      ) {
        matchedTheme = "rhythm";
        reply =
          lang === "vi"
            ? `Về nhịp thở và giọng kể:
Trẻ em hấp thụ câu chuyện qua không khí tĩnh lặng giữa các câu từ. Khi chuyển từ cảnh lao động sang cảnh bà cụ dặn dò bên bến sông, hãy dừng lại 2–3 giây, hít vào thật êm để trẻ kịp vẽ nên bức tranh trong tâm tưởng. Tốc độ lý tưởng cho lứa tuổi 8–9 là khoảng 100–115 từ/phút.`
            : `Regarding breathing rhythm in storytelling:
Children absorb the living picture in the silent space between words. When transitioning between scenes, pause for 2–3 gentle seconds, taking an unhurried in-breath so the children's imagination can settle the picture. The ideal pacing for 8–9 year olds is 100–115 words per minute.`;
      } else {
        matchedTheme = "general";
        reply =
          lang === "vi"
            ? `Cảm ơn bạn! Đứng dưới Đạo và triết lý Waldorf tại Việt Nam, câu chuyện "${
                selectedStory?.title || "đang luyện"
              }" là cầu nối tuyệt vời giữa văn hóa bản địa và sự trưởng thành của trẻ. Bạn có thể dùng bản đồ cảnh để luyện kể từng phần, hoặc xuất hồ sơ lớp học để lưu giữ hành trình này.`
            : `Thank you! Guided by DAO.md and the Waldorf ethos in Vietnam, the story of "${
                selectedStory?.title || "the living garden"
              }" bridges local cultural roots with child development. You can practice individual scenes, measure your acoustic rhythm, or export the classroom portfolio anytime.`;
      }

      const latencyMs = Date.now() - callStartTime;

      const localContextInfo: AIContextTelemetry = {
        kind: "chat",
        title: "Local Pedagogical Synthesizer (Offline DAO Engine)",
        prompt,
        systemPrompt: `You are ViWaldorf, a gentle, wise Waldorf pedagogical companion in Vietnam, strictly governed by DAO.md.
Principles:
- Nurture the child's living flame (head, heart, hands) and breathing rhythm.
- Deep reverence for Vietnamese culture, seasonal festivals, folklore, and regional dialects.
- Guide educators in Goethean arts (Wet-on-Wet watercolor, beeswax block crayons, chalkboard pastel art).
- Provide warm, non-punitive, non-judgmental guidance.`,
        model: "Local Pedagogical Synthesizer (DAO.md Heuristics)",
        provider: "local",
        historyTurns: messages.length,
        injectedContext: {
          language: lang,
          ...(selectedStory
            ? {
                storyTitle: selectedStory.title,
                storyAge: selectedStory.ageRange,
                storyGoal: selectedStory.goal,
              }
            : {}),
          dialectRulesCount: data.dialectRules?.length || 0,
          matchedPedagogicalTheme: matchedTheme,
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
        rawPayload: {
          prompt,
          matchedTheme,
          activeStory: selectedStory?.title,
          offlineReason: aiProvider === "local" ? "User selected local offline mode" : "Fallback heuristics active",
        },
        latencyMs,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "viwaldorf",
          text: reply,
          contextInfo: localContextInfo,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageHeader title={t.chat.title} subtitle={t.chat.subtitle} />

        {/* Global Context Inspector Mode Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-white/80 p-1.5 rounded-xl border border-line shadow-sm text-xs">
          <span className="text-inkSoft px-2 flex items-center gap-1 font-medium">
            <Sliders className="w-3.5 h-3.5 text-forest" />
            <span className="hidden sm:inline">{t.aiInspector.viewModeLabel}:</span>
          </span>
          <button
            onClick={() => setInspectorMode("compact")}
            className={`px-2.5 py-1 rounded-lg transition font-medium ${
              inspectorMode === "compact"
                ? "bg-forest text-white shadow-xs font-semibold"
                : "text-inkSoft hover:text-ink hover:bg-[#F7ECD8]/50"
            }`}
          >
            {t.aiInspector.viewModeCompact}
          </button>
          <button
            onClick={() => setInspectorMode("expanded")}
            className={`px-2.5 py-1 rounded-lg transition font-medium ${
              inspectorMode === "expanded"
                ? "bg-forest text-white shadow-xs font-semibold"
                : "text-inkSoft hover:text-ink hover:bg-[#F7ECD8]/50"
            }`}
          >
            {t.aiInspector.viewModeExpanded}
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="garden-card space-y-2">
        <div className="text-xs font-semibold text-forestDark flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-terra" />
          <span>{t.chat.suggestionsTitle}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              className="text-left p-2.5 rounded-lg border border-line bg-white/70 hover:bg-white hover:border-forest/40 text-xs text-ink transition leading-snug"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="garden-card space-y-4 min-h-[420px] max-h-[560px] overflow-y-auto p-4 sm:p-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const telemetry = msg.contextInfo;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`p-2 rounded-full flex-shrink-0 ${
                  isUser ? "bg-forest text-white" : "bg-[#F7ECD8] text-terra"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] space-y-1.5 ${
                  isUser ? "text-right" : "text-left"
                }`}
              >
                {/* Bubble Container */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm text-left ${
                    isUser
                      ? "bg-forest text-white rounded-tr-none"
                      : "bg-[#FFFDF9] border border-line text-ink rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-line/30 pb-1">
                    <span
                      className={`text-[10px] font-bold ${
                        isUser ? "text-[#BFD3B8]" : "text-terra uppercase tracking-wider"
                      }`}
                    >
                      {isUser ? "You" : "ViWaldorf Assistant"}
                    </span>
                    {msg.timestamp && (
                      <span
                        className={`text-[10px] ${
                          isUser ? "text-[#D5E5CF]" : "text-inkSoft"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    )}
                  </div>

                  <div>{msg.text}</div>
                </div>

                {/* Per-Message Prompt & Context Inspector Trigger */}
                {telemetry && (
                  <div
                    className={`flex items-center gap-1.5 text-[11px] ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <button
                      onClick={() => handleOpenInspector(msg)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 border border-line text-forestDark hover:bg-[#F7ECD8] transition shadow-xs group"
                      title={t.aiInspector.inspectMessageBtn}
                    >
                      <Terminal className="w-3 h-3 text-forest group-hover:text-terra transition-colors" />
                      <span className="font-medium text-[10px] sm:text-[11px]">
                        {t.aiInspector.inspectMessageBtn}
                      </span>
                      {telemetry.model && (
                        <span className="text-inkSoft font-mono text-[9px] sm:text-[10px] bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-line/50">
                          {telemetry.model.replace("Local ", "")}
                        </span>
                      )}
                      {telemetry.latencyMs !== undefined && (
                        <span className="text-inkSoft font-mono text-[9px] sm:text-[10px] hidden sm:inline">
                          · {telemetry.latencyMs}ms
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Always-Expanded Context Strip (When Expanded Mode is ON) */}
                {inspectorMode === "expanded" && telemetry && (
                  <div className="p-2 rounded-xl bg-[#F7ECD8]/40 border border-line/70 text-[10px] sm:text-[11px] font-mono text-inkSoft space-y-1 text-left animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-line/40 pb-1">
                      <span className="font-semibold text-forestDark">
                        {telemetry.title || telemetry.model}
                      </span>
                      <button
                        onClick={() => handleOpenInspector(msg)}
                        className="text-forest hover:underline font-bold"
                      >
                        Inspect Payload →
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span>Model: <strong className="text-forestDark">{telemetry.model}</strong></span>
                      {telemetry.historyTurns !== undefined && (
                        <span>History: <strong className="text-forestDark">{telemetry.historyTurns} turns</strong></span>
                      )}
                      {telemetry.injectedContext?.storyTitle && (
                        <span>Story: <strong className="text-forestDark">{telemetry.injectedContext.storyTitle}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-inkSoft italic animate-pulse">
            <Bot className="w-4 h-4 text-forest" />
            <span>{t.chat.thinking}</span>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t.chat.placeholder}
          className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isRunning}
          className="btn-primary"
        >
          <Send className="w-4 h-4" />
          <span>{t.chat.sendBtn}</span>
        </button>
      </div>

      {/* Technical Details Disclosure */}
      <div className="pt-2">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center gap-1.5 text-xs text-inkSoft hover:text-forest"
        >
          {showTechnicalDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          <span>{t.chat.technicalDetailsTitle}</span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-2 p-3 rounded-lg bg-[#F7ECD8]/50 border border-line text-[11px] text-inkSoft space-y-1 font-mono">
            <div>{t.chat.activeModelsLabel}</div>
            <div>
              Active Tool Handlers: xuvi_self_status, xuvi_garden_update, xuvi_project_edit
            </div>
            <div className="text-[10px] text-forest pt-1">
              • Direct message inspector active: Click "Prompt & Context" on any message above to view exact System Prompts and API JSON payloads.
            </div>
          </div>
        )}
      </div>

      {/* AI Context & Telemetry Modal Inspector */}
      <AIContextInspector
        telemetry={selectedTelemetry}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onApplyTunedOutput={handleApplyTunedOutput}
        activeStoryContext={
          selectedStory
            ? {
                title: selectedStory.title,
                ageRange: selectedStory.ageRange,
                goal: selectedStory.goal,
              }
            : undefined
        }
      />
    </div>
  );
}
