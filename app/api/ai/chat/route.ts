import { NextRequest, NextResponse } from "next/server";
import { AIContextTelemetry } from "@/lib/types";

const SYSTEM_INSTRUCTION = `You are ViWaldorf, a gentle, wise Waldorf pedagogical companion in Vietnam, strictly governed by DAO.md.
Principles:
- Nurture the child's living flame (head, heart, hands) and breathing rhythm (in-breath focus, out-breath creative movement).
- Deep reverence for Vietnamese culture, seasonal festivals, folklore, and regional dialects (Northern, Central, Southern). Never penalize regional accents.
- Guide educators in Goethean arts (Wet-on-Wet watercolor with lemon yellow, Prussian blue, vermilion; beeswax block crayons; chalkboard pastel art).
- Provide warm, non-punitive, non-judgmental guidance. Never use cold numeric grading or rankings.
- Respond warmly and poetically in the user's language (Vietnamese or English). Keep answers practical and inspiring.`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const {
      prompt,
      history = [],
      lang = "vi",
      activeStory,
      dialectCount,
      systemPromptOverride,
      modelOverride,
      temperature,
      maxOutputTokens,
    } = body;

    const clientGoogleKey = request.headers.get("x-goog-api-key") || "";
    const serverGoogleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    const apiKey = clientGoogleKey.trim() || serverGoogleKey.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Google API Key provided. Configure in Settings." },
        { status: 401 }
      );
    }

    const injectedStoryNote = activeStory?.title
      ? `\nActive Classroom Story: "${activeStory.title}" (${activeStory.ageRange || "Ages 7-9"} - ${activeStory.goal || "Oral imagination"}).`
      : "";
    const effectiveSystemInstruction = systemPromptOverride || (SYSTEM_INSTRUCTION + injectedStoryNote);

    const contents = [
      ...history.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const generationConfig = {
      temperature: typeof temperature === "number" ? Math.max(0, Math.min(2, temperature)) : 0.7,
      maxOutputTokens: typeof maxOutputTokens === "number" ? Math.max(100, Math.min(8192, maxOutputTokens)) : 1024,
    };

    const payloadBody = {
      contents,
      systemInstruction: {
        parts: [{ text: effectiveSystemInstruction }],
      },
      generationConfig,
    };

    // Use modelOverride if provided, otherwise fallback chain
    const defaultModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
    const models = modelOverride
      ? [modelOverride, ...defaultModels.filter((m) => m !== modelOverride)]
      : defaultModels;
    let lastError = "";

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadBody),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            const latencyMs = Date.now() - startTime;
            const contextInfo: AIContextTelemetry = {
              kind: "chat",
              title: `Assistant Chat (${model})`,
              prompt,
              systemPrompt: effectiveSystemInstruction,
              model,
              provider: "google",
              historyTurns: history.length,
              injectedContext: {
                language: lang,
                ...(activeStory?.title
                  ? {
                      storyTitle: activeStory.title,
                      storyAge: activeStory.ageRange,
                      storyGoal: activeStory.goal,
                    }
                  : {}),
                ...(dialectCount !== undefined ? { dialectRulesCount: dialectCount } : {}),
                governance: "DAO.md (Life First, Truthfulness, Privacy, Learnability)",
              },
              generationConfig,
              rawPayload: payloadBody,
              latencyMs,
              timestamp: new Date().toISOString(),
            };

            return NextResponse.json({ text: reply, model, contextInfo });
          }
        } else {
          const err = await res.json().catch(() => ({}));
          lastError = err.error?.message || `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    return NextResponse.json(
      { error: "Gemini API error: " + lastError },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
