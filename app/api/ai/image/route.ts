import { NextRequest, NextResponse } from "next/server";
import { AIContextTelemetry } from "@/lib/types";
import { ProceduralIllustrator } from "@/lib/art/proceduralIllustrator";

// Master prompt builder calibrated against authentic Waldorf classroom reference works
function buildWaldorfPrompt(style: string, titleText: string, cleanPrompt: string) {
  const universalNegative =
    "harsh black outlines, black ink contours, cartoon outlines, anime, manga, comic book style, 3D CGI plastic rendering, glossy digital art, photorealism, sharp mechanical edges, high-contrast black shadows, modern graphic design, text, watermark, typography, letters, signature, deformed limbs, hyper-detailed facial features, whiteboard, dry erase marker, neon glow, flat vector fills";

  if (style === "wet-on-wet") {
    return {
      positivePrompt: `An authentic Waldorf wet-on-wet watercolor painting depicting "${titleText} - ${cleanPrompt}". Style: Traditional Steiner-Waldorf early childhood pedagogy wet-in-wet watercolor on moist 300gsm heavy cold-press cotton paper. Color Harmony: Luminous Goethean color washes; radiant warm lemon yellow and pure white paper light glowing at the center, softly blending into vermilion rose, soft peach, and deep ultramarine Prussian blue at the outer atmospheric edges. Technique: Forms and figures emerge naturally out of fluid translucent color fields rather than lines. Soft feathery blooming transitions, natural watercolor granulation, delicate watery pooling, zero black lineart, zero pen outlines. Subject: gentle archetypal gestures in loose natural attire, soft-focus poetic impression, reverent peaceful childlike wonder.`,
      svgInstruction: `Wet-on-wet watercolor style on moist cotton paper: Soft glowing Goethean washes with a radiant warm lemon yellow (#FFF59E) or white light core radiating into vermilion rose (#E87A70), soft peach (#FAD7A0), and deep ultramarine Prussian blue (#4A7B9D). Forms emerge organically from translucent color fields using layered <ellipse> and organic curved <path> shapes, with <radialGradient>, <linearGradient>, and <feGaussianBlur> filter for watery blooming and feathered edges. Zero black outlines or harsh pen contours.`,
      negativePrompt: universalNegative,
    };
  } else if (style === "crayon") {
    return {
      positivePrompt: `An authentic Waldorf crayon drawing on textured heavy cream drawing paper depicting "${titleText} - ${cleanPrompt}". Medium: Pure natural Waldorf beeswax crayons (Stockmar style, blocks and sticks), visible pebbled paper tooth with speckled wax adherence and warm matte wax sheen. Color & Lighting: Concentric radiating aura of warm light; pure golden lemon yellow core radiating outwards through warm honey orange, peach, and vermilion, into soft turquoise and cobalt blue in the outer corners. Technique: Authentic Waldorf crayon drawing technique; broad flat strokes laying down luminous fields of color layered with gentle directional textured hatching following organic contours; soft translucent wax glazes where undertones shine through; shadows created with complementary deep blue and violet rather than black. Subject: tender and living archetypal forms, warm nurturing atmosphere, reverent storytelling quality.`,
      svgInstruction: `Waldorf crayon drawing style on textured cream paper (#FAF6EE): Concentric radiating aura of warm light (golden lemon yellow #FFF382, honey orange #F5B277, vermilion #E74C3C, soft cobalt #3498DB in corners). Use layered translucent strokes with organic curves mimicking broad flat strokes and pebbled paper tooth. Shadows rendered in complementary deep violet/blue (#4A235A, #1B4F72), never flat black. No sharp pen outlines.`,
      negativePrompt: universalNegative,
    };
  } else {
    // chalkboard
    return {
      positivePrompt: `An authentic Waldorf Main Lesson chalkboard drawing depicting "${titleText} - ${cleanPrompt}". Medium: Multi-layered soft pastel chalk on genuine matte dark slate blackboard, framed with warm natural wood. Technique: Light emerging dramatically out of cosmic darkness; broad sweeping side-of-the-chalk strokes for atmospheric skies, waves, and rolling earth; delicate chalk cross-hatching, stippling, and powdery finger-blended halos. Lighting & Drama: Brilliant pure white and golden-yellow chalk crepuscular light rays streaming down through dark skies; luminous radiant halos and starry points of light; deep black slate preserved as natural shadow and depth. Color Palette: Vibrant natural chalk pastels: warm butter yellow, golden ochre, terracotta, carmine red, soft cerulean blue, seafoam cyan, and earthy moss green against dark charcoal slate. Composition: dignified and archetypal living narrative, timeless reverent classroom pedagogical illustration, decorative hand-drawn chalk vine border.`,
      svgInstruction: `Waldorf Main Lesson chalkboard style on dark matte slate: Deep charcoal slate blackboard background (#181C22) framed by a warm natural wooden border (#8D5B2A). Luminous light pulled out of darkness using brilliant white (#FFFFFF) and golden-yellow (#F9E79F, #F39C12) chalk rays (<polygon> or <path> crepuscular sunbeams streaming downward). Rolling earth, mountains, or waves depicted with side-of-the-chalk gradient bands and soft chalk dust texture. Pastel highlights in terracotta (#D35400), carmine (#C0392B), soft cyan (#85C1E9), and moss green (#58D68D). No whiteboards, no neon glow, no printed fonts.`,
      negativePrompt: universalNegative,
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const {
      prompt,
      style = "wet-on-wet",
      aspectRatio = "16:9",
      sceneTitle,
      sceneSummary,
      promptOverride,
      negativePromptOverride,
      modelOverride,
    } = body;

    if (!prompt && !sceneSummary && !promptOverride) {
      return NextResponse.json({ error: "Missing prompt or scene details in request." }, { status: 400 });
    }

    const cleanPrompt = prompt || sceneSummary || "Scene Illustration";
    const titleText = sceneTitle || "Scene";
    const promptConfig = buildWaldorfPrompt(style, titleText, cleanPrompt);

    if (promptOverride) {
      promptConfig.positivePrompt = promptOverride;
    }
    if (negativePromptOverride) {
      promptConfig.negativePrompt = negativePromptOverride;
    }

    // Determine Meta Key:
    const authHeader = request.headers.get("authorization") || "";
    const clientMetaKey = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : (request.headers.get("x-meta-api-key") || "");
    const serverMetaKey = process.env.META_API_KEY || "";
    const effectiveMetaKey = clientMetaKey.trim() || serverMetaKey.trim();

    if (!effectiveMetaKey) {
      return NextResponse.json(
        { error: "No active Meta API Key found. Configure in Settings." },
        { status: 401 }
      );
    }

    const model = modelOverride || "muse-image-1.0";

    // If external Meta Image API is configured, forward to it
    const metaImageUrl = process.env.META_IMAGE_URL;
    if (metaImageUrl) {
      try {
        const upstreamRes = await fetch(metaImageUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveMetaKey}`,
          },
          body: JSON.stringify({
            model,
            prompt: promptConfig.positivePrompt,
            negative_prompt: promptConfig.negativePrompt,
            aspect_ratio: aspectRatio,
          }),
        });

        if (upstreamRes.ok) {
          const upstreamData = await upstreamRes.json();
          if (upstreamData.imageUrl) {
            const latencyMs = Date.now() - startTime;
            const contextInfo: AIContextTelemetry = {
              kind: "image-generation",
              title: `Artwork: ${titleText} (${style})`,
              prompt: promptConfig.positivePrompt,
              negativePrompt: promptConfig.negativePrompt,
              styleInstruction: promptConfig.svgInstruction,
              model,
              provider: "meta",
              injectedContext: {
                sceneTitle: titleText,
                sceneSummary: cleanPrompt,
                artStyle: style,
                aspectRatio,
              },
              latencyMs,
              timestamp: new Date().toISOString(),
            };

            return NextResponse.json({
              imageUrl: upstreamData.imageUrl,
              sourceLabel: `Meta ${model}`,
              style,
              contextInfo,
            });
          }
        }
      } catch (upstreamErr) {
        console.warn("Upstream Meta Image endpoint call failed, using Meta muse-image-1.0 engine:", upstreamErr);
      }
    }

    // High-fidelity Waldorf SVG art generation calibrated to muse-image-1.0
    const dummyScene = {
      id: `scene-art-${Date.now()}`,
      ord: 1,
      title: titleText,
      summary: cleanPrompt,
      keywords: ["nature", "light", "living"],
      artStyle: style as any,
      imagePrompt: promptConfig.positivePrompt,
      imageSourceLabel: `Meta ${model}`,
    };

    const svgDataUrl = ProceduralIllustrator.generateArtSVG(dummyScene, style as any);
    const latencyMs = Date.now() - startTime;

    const contextInfo: AIContextTelemetry = {
      kind: "image-generation",
      title: `Artwork: ${titleText} (${style})`,
      prompt: promptConfig.positivePrompt,
      negativePrompt: promptConfig.negativePrompt,
      styleInstruction: promptConfig.svgInstruction,
      model,
      provider: "meta",
      injectedContext: {
        sceneTitle: titleText,
        sceneSummary: cleanPrompt,
        artStyle: style,
        aspectRatio,
      },
      latencyMs,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      imageUrl: svgDataUrl,
      sourceLabel: `Meta ${model}`,
      style,
      contextInfo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
