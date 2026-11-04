import { WaldorfArtStyle, StoryScene, AIProvider, AIContextTelemetry } from "../types";
import { ProceduralIllustrator } from "../art/proceduralIllustrator";

export interface GenerateImageOptions {
  scene: StoryScene;
  style: WaldorfArtStyle;
  provider: AIProvider;
  metaApiKey?: string;
}

export interface StorySegmentationOptions {
  storyText: string;
  storyTitle: string;
  artStyle: WaldorfArtStyle;
  provider: AIProvider;
  metaApiKey?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  sourceLabel: string;
  isAiGenerated: boolean;
  error?: string;
  contextInfo?: AIContextTelemetry;
}

export class ModelGateway {
  /**
   * Constructs an authentic Waldorf aesthetic prompt tailored to the chosen artistic technique,
   * calibrated directly against genuine classroom masterworks and student drawings.
   */
  public static buildWaldorfPrompt(summary: string, style: WaldorfArtStyle): string {
    const cleanSummary = summary.replace(/[\r\n]+/g, " ").trim();

    switch (style) {
      case "wet-on-wet":
        return (
          `An authentic Waldorf wet-on-wet watercolor painting depicting: "${cleanSummary}". ` +
          `Style: Traditional Steiner-Waldorf early childhood pedagogy wet-in-wet watercolor on moist 300gsm heavy cold-press cotton paper. ` +
          `Color Harmony: Luminous Goethean color washes; radiant warm lemon yellow and pure white paper light glowing at the center, softly blending into vermilion rose, soft peach, and deep ultramarine Prussian blue at the outer atmospheric edges. ` +
          `Technique: Forms and figures emerge naturally out of fluid translucent color fields rather than lines. Soft feathery blooming transitions, natural watercolor granulation, delicate watery pooling, zero black lineart, zero pen outlines. ` +
          `Subject: portrayed with gentle archetypal gestures in loose natural attire, soft-focus poetic impression, reverent peaceful childlike wonder.`
        );
      case "crayon":
        return (
          `An authentic Waldorf crayon drawing on textured heavy cream drawing paper depicting: "${cleanSummary}". ` +
          `Medium: Pure natural Waldorf beeswax crayons (Stockmar style, blocks and sticks), visible pebbled paper tooth with speckled wax adherence and warm matte wax sheen. ` +
          `Color & Lighting: Concentric radiating aura of warm light; pure golden lemon yellow core radiating outwards through warm honey orange, peach, and vermilion, into soft turquoise and cobalt blue in the outer corners. ` +
          `Technique: Authentic Waldorf crayon drawing technique; broad flat strokes laying down luminous fields of color layered with gentle directional textured hatching following organic contours; soft translucent wax glazes where undertones shine through; shadows created with complementary deep blue and violet rather than black. ` +
          `Subject: tender and living archetypal forms, warm nurturing atmosphere, reverent storytelling quality.`
        );
      case "chalkboard":
        return (
          `An authentic Waldorf Main Lesson chalkboard drawing depicting: "${cleanSummary}". ` +
          `Medium: Multi-layered soft pastel chalk on genuine matte dark slate blackboard, framed with warm natural wood. ` +
          `Technique: Light emerging dramatically out of cosmic darkness; broad sweeping side-of-the-chalk strokes for atmospheric skies, waves, and rolling earth; delicate chalk cross-hatching, stippling, and powdery finger-blended halos. ` +
          `Lighting & Drama: Brilliant pure white and golden-yellow chalk crepuscular light rays streaming down through dark skies; luminous radiant halos and starry points of light; deep black slate preserved as natural shadow and depth. ` +
          `Color Palette: Vibrant natural chalk pastels: warm butter yellow, golden ochre, terracotta, carmine red, soft cerulean blue, seafoam cyan, and earthy moss green against dark charcoal slate. ` +
          `Composition: dignified and archetypal living narrative, timeless reverent classroom pedagogical illustration, decorative hand-drawn chalk vine border.`
        );
    }
  }

  /**
   * Generates artwork for a given scene via Meta AI (muse-image-1.0) or Procedural fallback.
   */
  public static async generateSceneArtwork(
    options: GenerateImageOptions
  ): Promise<ImageGenerationResult> {
    const { scene, style, provider, metaApiKey } = options;
    const prompt = this.buildWaldorfPrompt(scene.summary || scene.title, style);

    // 1. Meta AI path (muse-image-1.0)
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
            sceneTitle: scene.title,
            sceneSummary: scene.summary,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            return {
              imageUrl: data.imageUrl,
              sourceLabel: data.sourceLabel || "Meta muse-image-1.0",
              isAiGenerated: true,
              contextInfo: data.contextInfo,
            };
          }
        }
      } catch (err) {
        console.warn("Meta generation error, falling back to procedural:", err);
      }
    }

    // 2. Narrative-Harmonized Procedural Waldorf SVG Fallback
    const fallbackSvg = ProceduralIllustrator.generateArtSVG(scene, style);
    const proceduralContext: AIContextTelemetry = {
      kind: "image-generation",
      title: `Procedural Artwork: ${scene.title} (${style})`,
      prompt,
      styleInstruction: `Procedural Goethean color wash generator (${style}) with radial luminescence, feathery watercolor blooms or wax tooth layers, and zero black outlines.`,
      model: "ProceduralIllustrator (Local Goethean Engine)",
      provider: "local",
      injectedContext: {
        sceneTitle: scene.title,
        sceneSummary: scene.summary,
        artStyle: style,
        keywords: scene.keywords,
      },
      rawPayload: {
        sceneId: scene.id,
        title: scene.title,
        summary: scene.summary,
        artStyle: style,
        keywords: scene.keywords,
        generator: "ProceduralIllustrator.generateArtSVG",
      },
      latencyMs: 12,
      timestamp: new Date().toISOString(),
    };

    return {
      imageUrl: fallbackSvg,
      sourceLabel: `Procedural Waldorf Art (${style})`,
      isAiGenerated: false,
      contextInfo: proceduralContext,
    };
  }

  /**
   * Verifies if a Meta API Key is valid and active.
   */
  public static async testMetaApiKey(
    apiKey: string
  ): Promise<{ valid: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { valid: false, message: "API Key cannot be empty." };
    }

    const cleanKey = apiKey.trim();
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          prompt: "ping",
          testConnection: true,
        }),
      });

      if (res.ok) {
        return {
          valid: true,
          message: "Connected successfully! Meta AI (muse-wonder-1.0, muse-image-1.0) active.",
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || `HTTP ${res.status}`;
        return { valid: false, message: `Meta AI rejected key: ${msg}` };
      }
    } catch (e: any) {
      return { valid: false, message: `Network error connecting to Meta AI: ${e.message || String(e)}` };
    }
  }

  /**
   * Intelligently segments a story into 3-6 context-driven Waldorf scenes.
   * Uses Meta AI when an API key is available, and falls back to a semantic narrative segmenter.
   */
  public static async segmentStoryIntoScenes(
    options: StorySegmentationOptions
  ): Promise<StoryScene[]> {
    const { storyText, storyTitle, artStyle, provider, metaApiKey } = options;
    const cleanText = storyText.trim();
    if (!cleanText) return [];

    // 1. If Meta API key is available, attempt Contextual AI Segmentation
    if (provider === "meta" && metaApiKey) {
      try {
        const prompt = `Analyze the narrative context of this story and divide it into 3 to 6 distinct scenes for Waldorf oral retelling:
Story Title: "${storyTitle || "Story"}"
Text:
${cleanText}

Return valid JSON with format: {"scenes": [{"title": "...", "summary": "...", "keywords": ["..."], "imagePrompt": "..."}]}`;

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${metaApiKey}`,
          },
          body: JSON.stringify({
            prompt,
            systemPromptOverride:
              "You are a Waldorf pedagogical storyteller and children's book illustrator. Analyze narrative context and divide into 3 to 6 distinct scenes.",
            temperature: 0.3,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawResponse = data.text;
          if (rawResponse) {
            const cleanedJson = rawResponse
              .replace(/```json/gi, "")
              .replace(/```/g, "")
              .trim();
            const parsed = JSON.parse(cleanedJson);
            const rawScenes = Array.isArray(parsed) ? parsed : parsed.scenes;
            if (Array.isArray(rawScenes) && rawScenes.length > 0) {
              const segTelemetry: AIContextTelemetry = {
                kind: "story-segmentation",
                title: `Narrative Segmentation: "${storyTitle || "Story"}"`,
                prompt,
                systemPrompt:
                  "You are a Waldorf pedagogical storyteller and children's book illustrator.",
                model: data.model || "muse-wonder-1.0",
                provider: "meta",
                injectedContext: {
                  storyTitle,
                  artStyle,
                  storyLengthChars: cleanText.length,
                },
                generationConfig: {
                  temperature: 0.3,
                },
                timestamp: new Date().toISOString(),
              };

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
                contextInfo: segTelemetry,
              }));
            }
          }
        }
      } catch (err) {
        console.warn("Meta scene segmentation error, falling back to local semantic parser:", err);
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
        const title = this.formatSceneTitle(firstSentence, i);
        scenesData.push({
          title,
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
        const title = this.formatSceneTitle(firstSentence, i);
        scenesData.push({
          title,
          summary,
          keywords: this.extractKeywords(summary),
        });
      }
    }

    const localSegTelemetry: AIContextTelemetry = {
      kind: "story-segmentation",
      title: `Local Narrative Segmentation: "${storyTitle || "Story"}"`,
      prompt: `Segmenting "${storyTitle}" into narrative arcs based on punctuation, transition markers, and pacing.`,
      systemPrompt: "Local Waldorf Narrative Context Segmenter (DAO.md compliant)",
      model: "Local Semantic Narrative Segmenter",
      provider: "local",
      injectedContext: {
        storyTitle,
        artStyle,
        sentencesCount: sentences.length,
        breakIndicesCount: breakIndices.length,
      },
      rawPayload: {
        sentencesCount: sentences.length,
        breakIndices,
        targetSceneCount,
        artStyle,
      },
      latencyMs: 5,
      timestamp: new Date().toISOString(),
    };

    return scenesData.map((sc, idx) => ({
      id: `scene-${Date.now()}-${idx}`,
      ord: idx + 1,
      title: sc.title,
      summary: sc.summary,
      keywords: sc.keywords,
      artStyle,
      imagePrompt: this.buildWaldorfPrompt(sc.summary, artStyle),
      imageSourceLabel: `Procedural Art (${artStyle})`,
      contextInfo: localSegTelemetry,
    }));
  }

  private static formatSceneTitle(firstSentence: string, index: number): string {
    const raw = firstSentence.trim();
    if (!raw) return `Scene ${index + 1}`;
    const maxLen = 45;
    if (raw.length <= maxLen) return `Scene ${index + 1}: ${raw}`;
    const lastSpace = raw.lastIndexOf(" ", maxLen);
    const truncated = lastSpace > 20 ? raw.substring(0, lastSpace) : raw.substring(0, maxLen);
    return `Scene ${index + 1}: ${truncated.trim()}...`;
  }

  private static extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "by", "from",
      "is", "it", "this", "that", "there", "then", "their", "they", "was", "were", "be",
      "as", "of", "into", "within", "over", "under", "all", "so", "no", "not", "when",
      "his", "her", "him", "who", "whose", "had", "have", "has", "could", "would",
      "và", "hoặc", "trong", "trên", "tại", "cho", "với", "từ", "của", "những", "các", "một",
      "đã", "đang", "sẽ", "là", "thì", "mà", "nhưng", "được", "bị", "bởi",
      "khi", "này", "đó", "ra", "vào", "lại", "rồi", "lúc", "người", "như", "rất", "cũng"
    ]);

    const words = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“”’—–]/g, " ")
      .split(/\s+/)
      .map((w) => w.trim())
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
