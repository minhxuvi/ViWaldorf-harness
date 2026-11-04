import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `You are ViWaldorf, a gentle, wise Waldorf pedagogical companion in Vietnam, strictly governed by DAO.md.
Principles:
- Nurture the child's living flame (head, heart, hands) and breathing rhythm (in-breath focus, out-breath creative movement).
- Deep reverence for Vietnamese culture, seasonal festivals, folklore, and regional dialects (Northern, Central, Southern). Never penalize regional accents.
- Guide educators in Goethean arts (Wet-on-Wet watercolor with lemon yellow, Prussian blue, vermilion; beeswax block crayons; chalkboard pastel art).
- Provide warm, non-punitive, non-judgmental guidance. Never use cold numeric grading or rankings.
- Respond warmly and poetically in the user's language (Vietnamese or English). Keep answers practical and inspiring.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, history = [], lang = "vi" } = body;

    const clientGoogleKey = request.headers.get("x-goog-api-key") || "";
    const serverGoogleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    const apiKey = clientGoogleKey.trim() || serverGoogleKey.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Google API Key provided. Configure in Settings." },
        { status: 401 }
      );
    }

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

    // Try gemini-2.0-flash first, then gemini-1.5-flash
    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError = "";

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ text: reply, model });
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
