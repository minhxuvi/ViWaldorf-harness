"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { DemoBanner, PageHeader } from "@/components/PageHeader";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "viwaldorf";
  text: string;
}

export default function ChatPage() {
  const { t, lang, selectedStory, googleApiKey, aiProvider } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-0",
      sender: "viwaldorf",
      text:
        lang === "vi"
          ? "Chào bạn! Mình là trợ lý ViWaldorf. Mình có thể giúp bạn chuẩn bị bài kể chuyện, gợi ý cách vẽ tranh Wet-on-Wet hay Crayon, hoặc cùng xem lại nhịp tuần lớp học. Bạn muốn bắt đầu từ việc nào?"
          : "Warm greetings! I am your ViWaldorf assistant. I can help you prepare oral storytelling, suggest Wet-on-Wet or Crayon painting exercises, or review your weekly rhythm. Where shall we begin?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsRunning(true);

    // Attempt real Google Gemini call if configured or on production
    if (aiProvider === "google" || googleApiKey) {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(googleApiKey ? { "x-goog-api-key": googleApiKey } : {}),
          },
          body: JSON.stringify({
            prompt,
            history: messages,
            lang,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            setMessages((prev) => [
              ...prev,
              {
                id: `b-${Date.now()}`,
                sender: "viwaldorf",
                text: data.text,
              },
            ]);
            setIsRunning(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Gemini chat fetch error, falling back to local heuristics:", err);
      }
    }

    // Pedagogical response synthesis fallback
    setTimeout(() => {
      let reply = "";
      const lower = prompt.toLowerCase();

      if (lower.includes("wet-on-wet") || lower.includes("vẽ") || lower.includes("art") || lower.includes("crayon")) {
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
      } else if (lower.includes("breath") || lower.includes("thở") || lower.includes("rhythm") || lower.includes("nhịp")) {
        reply =
          lang === "vi"
            ? `Về nhịp thở và giọng kể:
Trẻ em hấp thụ câu chuyện qua không khí tĩnh lặng giữa các câu từ. Khi chuyển từ cảnh lao động sang cảnh bà cụ dặn dò bên bến sông, hãy dừng lại 2–3 giây, hít vào thật êm để trẻ kịp vẽ nên bức tranh trong tâm tưởng. Tốc độ lý tưởng cho lứa tuổi 8–9 là khoảng 100–115 từ/phút.`
            : `Regarding breathing rhythm in storytelling:
Children absorb the living picture in the silent space between words. When transitioning between scenes, pause for 2–3 gentle seconds, taking an unhurried in-breath so the children's imagination can settle the picture. The ideal pacing for 8–9 year olds is 100–115 words per minute.`;
      } else {
        reply =
          lang === "vi"
            ? `Cảm ơn bạn! Đứng dưới Đạo và triết lý Waldorf tại Việt Nam, câu chuyện "${selectedStory?.title || "đang luyện"}" là cầu nối tuyệt vời giữa văn hóa bản địa và sự trưởng thành của trẻ. Bạn có thể dùng bản đồ cảnh để luyện kể từng phần, hoặc xuất hồ sơ lớp học để lưu giữ hành trình này.`
            : `Thank you! Guided by DAO.md and the Waldorf ethos in Vietnam, the story of "${selectedStory?.title || "the living garden"}" bridges local cultural roots with child development. You can practice individual scenes, measure your acoustic rhythm, or export the classroom portfolio anytime.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "viwaldorf",
          text: reply,
        },
      ]);
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <DemoBanner />

      <PageHeader title={t.chat.title} subtitle={t.chat.subtitle} />

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
      <div className="garden-card space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto p-4 sm:p-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
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
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-forest text-white rounded-tr-none"
                    : "bg-[#FFFDF9] border border-line text-ink rounded-tl-none shadow-sm whitespace-pre-wrap"
                }`}
              >
                <div
                  className={`text-[10px] font-bold mb-1 ${
                    isUser ? "text-[#BFD3B8]" : "text-terra uppercase tracking-wider"
                  }`}
                >
                  {isUser ? "You" : "ViWaldorf Assistant"}
                </div>
                <div>{msg.text}</div>
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
          {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{t.chat.technicalDetailsTitle}</span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-2 p-3 rounded-lg bg-[#F7ECD8]/50 border border-line text-[11px] text-inkSoft space-y-1 font-mono">
            <div>{t.chat.activeModelsLabel}</div>
            <div>
              Active Tool Handlers: xuvi_self_status, xuvi_garden_update, xuvi_project_edit
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
