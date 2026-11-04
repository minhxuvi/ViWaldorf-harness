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
   * Generates artwork for a given scene via Google Imagen 3, Meta AI, or Procedural fallback.
   */
  public static async generateSceneArtwork(
    options: GenerateImageOptions
  ): Promise<ImageGenerationResult> {
    const { scene, style, provider, googleApiKey, metaApiKey } = options;
    const prompt = this.buildWaldorfPrompt(scene.summary || scene.title, style);

    // 1. Google Imagen 3 path
    if (provider === "google" || (googleApiKey && provider !== "meta" && provider !== "local")) {
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
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            return {
              imageUrl: data.imageUrl,
              sourceLabel: data.sourceLabel || "Google Imagen 3 AI",
              isAiGenerated: true,
            };
          }
        }

        // Try direct client call if server returned error and client has key
        if (googleApiKey) {
          const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(
            googleApiKey
          )}`;
          const directRes = await fetch(directUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{ prompt }],
              parameters: { sampleCount: 1, aspectRatio: "16:9" },
            }),
          });

          if (directRes.ok) {
            const directJson = await directRes.json();
            const b64 = directJson.predictions?.[0]?.bytesBase64Encoded;
            const mime = directJson.predictions?.[0]?.mimeType || "image/jpeg";
            if (b64) {
              return {
                imageUrl: `data:${mime};base64,${b64}`,
                sourceLabel: "Google Imagen 3 AI",
                isAiGenerated: true,
              };
            }
          } else {
            const errBody = await directRes.json().catch(() => ({}));
            const errMsg = errBody.error?.message || `Google API status ${directRes.status}`;
            console.warn("Direct Google Imagen call failed:", errMsg);
            // Fallback with informative error
            const proceduralSvg = ProceduralIllustrator.generateArtSVG(scene, style);
            return {
              imageUrl: proceduralSvg,
              sourceLabel: `Procedural Art (${style}) - Quota/Error: ${errMsg.slice(0, 40)}`,
              isAiGenerated: false,
              error: errMsg,
            };
          }
        }
      } catch (err: any) {
        console.warn("Google Imagen generation error, falling back to procedural:", err);
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
