import { NextRequest, NextResponse } from "next/server";
import { AIContextTelemetry } from "@/lib/types";

// Master prompt builder calibrated against authentic Waldorf classroom reference works
function buildWaldorfPrompt(style: string, titleText: string, cleanPrompt: string) {
  const universalNegative =
    "harsh black outlines, black ink contours, cartoon outlines, anime, manga, comic book style, 3D CGI plastic rendering, glossy digital art, photorealism, sharp mechanical edges, high-contrast black shadows, modern graphic design, text, watermark, typography, letters, signature, deformed limbs, hyper-detailed facial features, whiteboard, dry erase marker, neon glow, flat vector fills";

  if (style === "wet-on-wet") {
    return {
      positivePrompt: `An authentic Waldorf wet-on-wet watercolor painting depicting "${titleText} - ${cleanPrompt}". Style: Traditional Steiner-Waldorf early childhood pedagogy wet-in-wet watercolor on moist 300gsm heavy cold-press cotton paper. Color Harmony: Luminous Goethean color washes; radiant warm lemon yellow and pure white paper light glowing at the center, softly blending into vermilion rose, soft peach, and deep ultramarine Prussian blue at the outer atmospheric edges. Technique: Forms and figures emerge naturally out of fluid translucent color fields rather than lines. Soft feathery blooming transitions, natural watercolor granulation, delicate watery pooling, zero black lineart, zero pen outlines. Subject: gentle archetypal gestures in loose natural attire, soft-focus poetic impression, reverent peaceful childlike wonder.`,
      negativePrompt: universalNegative,
    };
  } else if (style === "crayon") {
    return {
      positivePrompt: `An authentic Waldorf crayon drawing on textured heavy cream drawing paper depicting "${titleText} - ${cleanPrompt}". Medium: Pure natural Waldorf beeswax crayons (Stockmar style, blocks and sticks), visible pebbled paper tooth with speckled wax adherence and warm matte wax sheen. Color & Lighting: Concentric radiating aura of warm light; pure golden lemon yellow core radiating outwards through warm honey orange, peach, and vermilion, into soft turquoise and cobalt blue in the outer corners. Technique: Authentic Waldorf crayon drawing technique; broad flat strokes laying down luminous fields of color layered with gentle directional textured hatching following organic contours; soft translucent wax glazes where undertones shine through; shadows created with complementary deep blue and violet rather than black. Subject: tender and living archetypal forms, warm nurturing atmosphere, reverent storytelling quality.`,
      negativePrompt: universalNegative,
    };
  } else {
    // chalkboard
    return {
      positivePrompt: `An authentic Waldorf Main Lesson chalkboard drawing depicting "${titleText} - ${cleanPrompt}". Medium: Multi-layered soft pastel chalk on genuine matte dark slate blackboard, framed with warm natural wood. Technique: Light emerging dramatically out of cosmic darkness; broad sweeping side-of-the-chalk strokes for atmospheric skies, waves, and rolling earth; delicate chalk cross-hatching, stippling, and powdery finger-blended halos. Lighting & Drama: Brilliant pure white and golden-yellow chalk crepuscular light rays streaming down through dark skies; luminous radiant halos and starry points of light; deep black slate preserved as natural shadow and depth. Color Palette: Vibrant natural chalk pastels: warm butter yellow, golden ochre, terracotta, carmine red, soft cerulean blue, seafoam cyan, and earthy moss green against dark charcoal slate. Composition: dignified and archetypal living narrative, timeless reverent classroom pedagogical illustration, decorative hand-drawn chalk vine border.`,
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
      return NextResponse.json({ error: "Thiếu nội dung prompt hoặc tóm tắt cảnh." }, { status: 400 });
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
        { error: "Chưa cấu hình Meta API Key. Vui lòng vào Cài đặt để thêm key." },
        { status: 401 }
      );
    }

    const model = modelOverride || "muse-image-1.0";
    const metaImageUrl = process.env.META_IMAGE_URL || "https://api.meta.ai/v1/images/generations";

    const upstreamRes = await fetch(metaImageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${effectiveMetaKey}`,
        "User-Agent": "ViWaldorfHarness/1.0",
      },
      body: JSON.stringify({
        model,
        prompt: promptConfig.positivePrompt,
      }),
    });

    if (!upstreamRes.ok) {
      const errData = await upstreamRes.json().catch(() => null);
      const errText =
        errData?.error?.message ||
        errData?.error ||
        `HTTP ${upstreamRes.status}: ${upstreamRes.statusText}`;
      return NextResponse.json(
        { error: `Meta AI (${model}) báo lỗi: ${errText}` },
        { status: upstreamRes.status >= 400 && upstreamRes.status < 600 ? upstreamRes.status : 502 }
      );
    }

    const upstreamData = await upstreamRes.json();
    let finalImageUrl = "";
    const firstItem = Array.isArray(upstreamData?.data) ? upstreamData.data[0] : null;

    if (firstItem?.b64_json) {
      finalImageUrl = firstItem.b64_json.startsWith("data:")
        ? firstItem.b64_json
        : `data:image/webp;base64,${firstItem.b64_json}`;
    } else if (firstItem?.url) {
      finalImageUrl = firstItem.url;
    } else if (upstreamData?.imageUrl) {
      finalImageUrl = upstreamData.imageUrl;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "Phản hồi từ Meta AI không chứa dữ liệu ảnh hợp lệ." },
        { status: 502 }
      );
    }

    const latencyMs = Date.now() - startTime;
    const contextInfo: AIContextTelemetry = {
      kind: "image-generation",
      title: `Artwork: ${titleText} (${style})`,
      prompt: promptConfig.positivePrompt,
      negativePrompt: promptConfig.negativePrompt,
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
      imageUrl: finalImageUrl,
      sourceLabel: `Tranh AI (Meta ${model})`,
      style,
      contextInfo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi kết nối tới dịch vụ tạo tranh: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
