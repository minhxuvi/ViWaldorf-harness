import { WaldorfArtStyle, StoryScene, AIProvider } from "../types";
import { ProceduralIllustrator } from "../art/proceduralIllustrator";

export interface GenerateImageOptions {
  scene: StoryScene;
  style: WaldorfArtStyle;
  provider: AIProvider;
  googleApiKey?: string;
  metaApiKey?: string;
}

export interface StorySegmentationOptions {
  storyText: string;
  storyTitle: string;
  artStyle: WaldorfArtStyle;
  provider: AIProvider;
  googleApiKey?: string;
  metaApiKey?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  sourceLabel: string;
  isAiGenerated: boolean;
  error?: string;
}

export class ModelGateway {
  /**
   * Constructs an authentic Waldorf aesthetic prompt tailored to the chosen artistic technique.
   */
  public static buildWaldorfPrompt(summary: string, style: WaldorfArtStyle): string {
    const cleanSummary = summary.replace(/[\r\n]+/g, " ").trim();

    switch (style) {
      case "wet-on-wet":
        return (
          `Authentic Waldorf watercolor wet-on-wet painting depicting: "${cleanSummary}". ` +
          `Luminous Goethean color washes, soft flowing transitions of lemon yellow, Prussian blue, and vermilion rose. ` +
          `No harsh outlines, translucent layered watery pigment, gentle warmth, peaceful fairy tale atmosphere, museum-grade art.`
        );
      case "crayon":
        return (
          `Authentic Waldorf beeswax block crayon illustration depicting: "${cleanSummary}". ` +
          `Drawn with broad flat edges of beeswax wax crayons on textured heavy cream paper. Warm ochre, earthy terracotta, ` +
          `deep forest green, and golden yellow tones. Tactile hand-drawn texture, gentle organic forms, warm children's book art.`
        );
      case "chalkboard":
        return (
          `Authentic Waldorf classroom chalkboard drawing depicting: "${cleanSummary}". ` +
          `Rendered with soft luminous pastel chalks (warm gold, soft turquoise, gentle rose) on dark matte slate blackboard. ` +
          `Soft atmospheric glow, delicate shading, master lesson drawing on slate board.`
        );
    }
  }

  /**
   * Generates artwork for a given scene via Google AI (multimodal / SVG), Meta AI, or Procedural fallback.
   */
  public static async generateSceneArtwork(
    options: GenerateImageOptions
  ): Promise<ImageGenerationResult> {
    const { scene, style, provider, googleApiKey, metaApiKey } = options;
    const prompt = this.buildWaldorfPrompt(scene.summary || scene.title, style);

    // 1. Google AI path
    if (provider === "google" || (googleApiKey && provider !== "meta" && provider !== "local")) {
      // 1A. Try through Next.js server proxy route
      try {
        const res = await fetch("/api/ai/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(googleApiKey ? { "x-goog-api-key": googleApiKey } : {}),
          },
          body: JSON.stringify({
            prompt,
            style,
            aspectRatio: "16:9",
            sceneTitle: scene.title,
            sceneSummary: scene.summary,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            return {
              imageUrl: data.imageUrl,
              sourceLabel: data.sourceLabel || "Google AI Artwork",
              isAiGenerated: true,
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn("Server proxy image call non-200:", errData);
        }
      } catch (proxyErr) {
        console.warn("Server proxy image call network error:", proxyErr);
      }

      // 1B. Direct client-side calls if server proxy failed and client has key
      if (googleApiKey) {
        // Try native multimodal image generation models
        const nativeModels = ["gemini-nano-banana-2.1", "gemini-2.5-flash-image", "gemini-2.0-flash-exp"];
        for (const model of nativeModels) {
          try {
            const nativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
              googleApiKey
            )}`;
            const nativeRes = await fetch(nativeUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Generate an authentic Waldorf style children's book illustration for: "${scene.title} - ${scene.summary}". Style: ${style}. Soft organic Goethean color harmony, warm and gentle feeling, artistic painting.`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseModalities: ["TEXT", "IMAGE"],
                },
              }),
            });

            if (nativeRes.ok) {
              const nativeJson = await nativeRes.json();
              const parts = nativeJson.candidates?.[0]?.content?.parts || [];
              for (const p of parts) {
                if (p.inlineData?.data) {
                  const mime = p.inlineData.mimeType || "image/png";
                  return {
                    imageUrl: `data:${mime};base64,${p.inlineData.data}`,
                    sourceLabel: `Google Gemini AI (${model})`,
                    isAiGenerated: true,
                  };
                }
              }
            }
          } catch (nativeClientErr) {
            console.warn(`Direct native image call ${model} error:`, nativeClientErr);
          }
        }

        // Try Scene-Specific Waldorf SVG generation with gemini-2.5-flash or gemini-2.0-flash
        const textModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        for (const textModel of textModels) {
          try {
            const svgUrl = `https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent?key=${encodeURIComponent(
              googleApiKey
            )}`;

            const styleDesc =
              style === "wet-on-wet"
                ? "Wet-on-wet watercolor with flowing Goethean washes of lemon yellow, Prussian blue, vermilion rose, soft organic blending, gentle atmospheric gradients, no harsh black borders."
                : style === "crayon"
                ? "Beeswax block crayon drawing with broad strokes of warm ochre, terracotta, moss green, and golden yellow on textured cream paper."
                : "Pastel chalkboard drawing with luminous warm yellow and soft azure chalk outlines glowing on a dark matte slate blackboard.";

            const svgRes = await fetch(svgUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are an authentic Waldorf artist and illustrator.
Create a complete, beautiful, valid SVG illustration depicting this story scene:
Title: "${scene.title}"
Summary: "${scene.summary}"
Style: ${styleDesc}

Requirements:
1. Root element: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
2. Visually illustrate the story elements: characters, mountains, heavens, pillar, earth, or objects in the scene.
3. Use layered SVG shapes (<path>, <ellipse>, <rect>, <defs> with <radialGradient>, <linearGradient>, soft gaussian blur filters).
4. Do NOT output markdown code blocks or backticks. Output ONLY valid SVG XML.`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.5,
                  maxOutputTokens: 8192,
                },
              }),
            });

            if (svgRes.ok) {
              const svgData = await svgRes.json();
              let rawText = svgData.candidates?.[0]?.content?.parts?.[0]?.text || "";
              rawText = rawText.replace(/```xml/gi, "").replace(/```svg/gi, "").replace(/```/g, "").trim();

              const startIdx = rawText.indexOf("<svg");
              if (startIdx !== -1) {
                const endIdx = rawText.lastIndexOf("</svg>");
                let svgContent =
                  endIdx !== -1
                    ? rawText.substring(startIdx, endIdx + 6)
                    : rawText.substring(startIdx) + "\n</svg>";
                const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
                return {
                  imageUrl: dataUrl,
                  sourceLabel: `Google Gemini AI (${textModel})`,
                  isAiGenerated: true,
                };
              }
            }
          } catch (svgClientErr) {
            console.warn(`Direct AI SVG generation error with ${textModel}:`, svgClientErr);
          }
        }
      }
    }

    // 2. Meta AI path
    if (provider === "meta" && metaApiKey) {
      try {
        const res = await fetch("/api/ai/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${metaApiKey}`,
          },
          body: JSON.stringify({
            prompt,
            style,
            provider: "meta",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            return {
              imageUrl: data.imageUrl,
              sourceLabel: "Meta muse-image-1.0",
              isAiGenerated: true,
            };
          }
        }
      } catch (err) {
        console.warn("Meta generation error, falling back:", err);
      }
    }

    // 3. Narrative-Harmonized Procedural Waldorf SVG Fallback
    const fallbackSvg = ProceduralIllustrator.generateArtSVG(scene, style);
    return {
      imageUrl: fallbackSvg,
      sourceLabel: `Procedural Waldorf Art (${style})`,
      isAiGenerated: false,
    };
  }

  /**
   * Verifies if a Google API Key is valid and active.
   */
  public static async testGoogleApiKey(
    apiKey: string
  ): Promise<{ valid: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { valid: false, message: "API Key cannot be empty." };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey.trim()
      )}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const modelCount = data.models?.length || 0;
        return {
          valid: true,
          message: `Connected successfully! Access to ${modelCount} Google Gemini/Imagen models confirmed.`,
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error?.message || `HTTP ${res.status}`;
        return { valid: false, message: `Google API rejected key: ${msg}` };
      }
    } catch (e: any) {
      return { valid: false, message: `Network error connecting to Google: ${e.message || String(e)}` };
    }
  }

  /**
   * Intelligently segments a story into 3-6 context-driven Waldorf scenes.
   * Uses Gemini AI when an API key is available, and falls back to a semantic narrative segmenter.
   */
  public static async segmentStoryIntoScenes(
    options: StorySegmentationOptions
  ): Promise<StoryScene[]> {
    const { storyText, storyTitle, artStyle, provider, googleApiKey, metaApiKey } = options;
    const cleanText = storyText.trim();
    if (!cleanText) return [];

    // 1. If Google API key is available, try Contextual AI Segmentation
    if (provider === "google" || (googleApiKey && provider !== "meta" && provider !== "local")) {
      if (googleApiKey) {
        try {
          const prompt = `You are a Waldorf pedagogical storyteller and children's book illustrator.
Analyze the narrative context of this story and divide it into 3 to 6 distinct, context-driven scenes for oral retelling practice.
Do NOT just divide naively by newlines; identify the true narrative arc (awakening/setting, journey/challenge, transformation/climax, gentle resolution).

Story Title: "${storyTitle || "Untitled Story"}"
Story Text:
"""
${cleanText}
"""

Art technique: ${artStyle} (Waldorf Goethean style).

Return ONLY valid JSON (no markdown formatting, no backticks, no extra commentary) in this exact structure:
{
  "scenes": [
    {
      "title": "Scene title",
      "summary": "Contextual excerpt or narrative focus (1-3 sentences)",
      "keywords": ["keyword1", "keyword2"],
      "imagePrompt": "Detailed Waldorf art prompt describing the mood, characters, and Goethean colors"
    }
  ]
}`;

          const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
          for (const model of models) {
            try {
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
                googleApiKey
              )}`;
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json",
                  },
                }),
              });

              if (res.ok) {
                const data = await res.json();
                const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawResponse) {
                  const cleanedJson = rawResponse
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();
                  const parsed = JSON.parse(cleanedJson);
                  const rawScenes = Array.isArray(parsed) ? parsed : parsed.scenes;
                  if (Array.isArray(rawScenes) && rawScenes.length > 0) {
                    return rawScenes.slice(0, 6).map((sc: any, idx: number) => ({
                      id: `scene-${Date.now()}-${idx}`,
                      ord: idx + 1,
                      title: sc.title || `Scene ${idx + 1}`,
                      summary: sc.summary || "",
                      keywords: Array.isArray(sc.keywords) ? sc.keywords.slice(0, 5) : [],
                      artStyle,
                      imagePrompt:
                        sc.imagePrompt ||
                        ModelGateway.buildWaldorfPrompt(sc.summary || sc.title, artStyle),
                      imageSourceLabel: `Procedural Art (${artStyle})`,
                    }));
                  }
                }
              }
            } catch (modelErr) {
              console.warn(`Gemini scene segmentation model ${model} error:`, modelErr);
            }
          }
        } catch (aiErr) {
          console.warn("AI scene segmentation error, falling back to local semantic parser:", aiErr);
        }
      }
    }

    // 2. Local Semantic Narrative Segmentation Fallback (offline / no API key)
    return this.segmentLocallyByContext(cleanText, storyTitle, artStyle);
  }

  /**
   * Local context-aware narrative segmenter.
   * Analyzes sentence boundaries and narrative transitions without depending on blank lines.
   */
  public static segmentLocallyByContext(
    storyText: string,
    storyTitle: string,
    artStyle: WaldorfArtStyle
  ): StoryScene[] {
    // 1. Break text into discrete sentences using punctuation boundaries
    const rawSentences = storyText
      .replace(/\r\n/g, "\n")
      .split(/(?<=[.?!;:\u2026])\s+|\n{2,}/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const sentences = rawSentences.length > 0 ? rawSentences : [storyText.trim()];

    // Narrative transition clues in Vietnamese and English
    const transitionRegex = /^(ngày xửa|ngày xưa|thuở xưa|một hôm|sáng hôm|chiều nọ|khi ấy|bỗng nhiên|thế rồi|đến khi|về sau|cuối cùng|từ đó|once upon|long ago|one day|one morning|one evening|as they|suddenly|then|later|when the|finally|in the end|from that day)/i;

    // Detect natural transition points
    const breakIndices: number[] = [0];
    sentences.forEach((s, idx) => {
      if (idx > 0 && transitionRegex.test(s) && idx - breakIndices[breakIndices.length - 1] >= 2) {
        breakIndices.push(idx);
      }
    });

    // If no explicit transitions detected or too few/many, segment based on narrative arc (3 to 5 scenes)
    const targetSceneCount = Math.min(5, Math.max(3, Math.ceil(sentences.length / 3)));
    const scenesData: { title: string; summary: string; keywords: string[] }[] = [];

    if (breakIndices.length >= 3 && breakIndices.length <= 6) {
      for (let i = 0; i < breakIndices.length; i++) {
        const start = breakIndices[i];
        const end = i + 1 < breakIndices.length ? breakIndices[i + 1] : sentences.length;
        const sceneSentences = sentences.slice(start, end);
        const summary = sceneSentences.join(" ");
        const firstSentence = sceneSentences[0] || "";
        const title = firstSentence.length > 40 ? firstSentence.substring(0, 40) + "..." : firstSentence;
        scenesData.push({
          title: `Scene ${i + 1}: ${title}`,
          summary,
          keywords: this.extractKeywords(summary),
        });
      }
    } else {
      // Chunk sentences evenly into targetSceneCount
      const chunkSize = Math.ceil(sentences.length / targetSceneCount);
      for (let i = 0; i < targetSceneCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(sentences.length, (i + 1) * chunkSize);
        if (start >= sentences.length) break;

        const sceneSentences = sentences.slice(start, end);
        const summary = sceneSentences.join(" ");
        const firstSentence = sceneSentences[0] || "";
        const title = firstSentence.length > 40 ? firstSentence.substring(0, 40) + "..." : firstSentence;
        scenesData.push({
          title: `Scene ${i + 1}: ${title}`,
          summary,
          keywords: this.extractKeywords(summary),
        });
      }
    }

    return scenesData.map((sc, idx) => ({
      id: `scene-${Date.now()}-${idx}`,
      ord: idx + 1,
      title: sc.title,
      summary: sc.summary,
      keywords: sc.keywords,
      artStyle,
      imagePrompt: this.buildWaldorfPrompt(sc.summary, artStyle),
      imageSourceLabel: `Procedural Art (${artStyle})`,
    }));
  }

  private static extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "by", "from",
      "và", "hoặc", "trong", "trên", "tại", "cho", "với", "từ", "của", "những", "các", "một",
      "đã", "đang", "sẽ", "là", "thì", "mà", "nhưng", "được", "bị", "bởi"
    ]);

    const words = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“”]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const counts: Record<string, number> = {};
    for (const w of words) {
      counts[w] = (counts[w] || 0) + 1;
    }

    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 4);
  }
}
