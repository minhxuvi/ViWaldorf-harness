import { WaldorfArtStyle, StoryScene, AIProvider } from "../types";
import { ProceduralIllustrator } from "../art/proceduralIllustrator";

export interface GenerateImageOptions {
  scene: StoryScene;
  style: WaldorfArtStyle;
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
        }
      } catch (proxyErr) {
        console.warn("Server proxy image call error:", proxyErr);
      }

      // 1B. Direct client-side calls if server proxy failed and client has key
      if (googleApiKey) {
        // Try native multimodal image generation with gemini-2.0-flash-exp
        try {
          const nativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(
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
                      text: `Generate an authentic Waldorf style children's book illustration for: "${scene.summary || scene.title}". Style: ${style}. Soft organic Goethean color harmony, warm and gentle feeling, artistic painting.`,
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
                  sourceLabel: "Google Gemini 2.0 AI Art",
                  isAiGenerated: true,
                };
              }
            }
          }
        } catch (nativeClientErr) {
          console.warn("Direct native image call error:", nativeClientErr);
        }

        // Try Scene-Specific Waldorf SVG generation with gemini-2.0-flash
        try {
          const svgUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
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

Rules:
- ViewBox must be "0 0 640 400" with width="100%" height="100%".
- Create richly layered, scene-specific visual elements illustrating the characters, landscape, heavens, earth, or objects in the summary.
- Use soft organic curves (<path>, <ellipse>, <radialGradient>, <linearGradient>, soft gaussian blur filters).
- Output ONLY the raw <svg>...</svg> element. Do not write markdown, do not write backticks, do not write explanations.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
              },
            }),
          });

          if (svgRes.ok) {
            const svgData = await svgRes.json();
            let rawText = svgData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            rawText = rawText.replace(/```xml/gi, "").replace(/```svg/gi, "").replace(/```/g, "").trim();

            const startIdx = rawText.indexOf("<svg");
            const endIdx = rawText.lastIndexOf("</svg>");
            if (startIdx !== -1 && endIdx !== -1) {
              const svgContent = rawText.substring(startIdx, endIdx + 6);
              const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
              return {
                imageUrl: dataUrl,
                sourceLabel: "Google Gemini AI (Scene Artwork)",
                isAiGenerated: true,
              };
            }
          }
        } catch (svgClientErr) {
          console.warn("Direct AI SVG generation error:", svgClientErr);
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

    // 3. High-fidelity Procedural Waldorf SVG Fallback
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
}
