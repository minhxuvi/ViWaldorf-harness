import { NextRequest, NextResponse } from "next/server";

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
      positivePrompt: `An authentic Waldorf beeswax block crayon illustration on textured heavy cream drawing paper depicting "${titleText} - ${cleanPrompt}". Medium: Pure natural Stockmar beeswax block crayons, visible pebbled paper tooth with speckled wax adherence and warm matte wax sheen. Color & Lighting: Concentric radiating aura of warm light; pure golden lemon yellow core radiating outwards through warm honey orange, peach, and vermilion, into soft turquoise and cobalt blue in the outer corners. Technique: Broad flat-edge wax block strokes layered with fine directional textured hatching following living organic contours; soft translucent layering where undertones shine through; shadows created with complementary deep blue and violet rather than black. Subject: tender and living archetypal forms, warm nurturing atmosphere, reverent storytelling quality.`,
      svgInstruction: `Waldorf beeswax block crayon style on textured cream paper (#FAF6EE): Concentric radiating aura of warm light (golden lemon yellow #FFF382, honey orange #F5B277, vermilion #E74C3C, soft cobalt #3498DB in corners). Use layered translucent strokes with organic curves mimicking broad 45-degree flat-edge block crayon strokes and pebbled paper tooth. Shadows rendered in complementary deep violet/blue (#4A235A, #1B4F72), never flat black. No sharp pen outlines.`,
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
  try {
    const body = await request.json();
    const { prompt, style = "wet-on-wet", aspectRatio = "16:9", provider, sceneTitle, sceneSummary } = body;

    if (!prompt && !sceneSummary) {
      return NextResponse.json({ error: "Missing prompt or scene details in request." }, { status: 400 });
    }

    const cleanPrompt = prompt || sceneSummary;
    const titleText = sceneTitle || "Scene";
    const promptConfig = buildWaldorfPrompt(style, titleText, cleanPrompt);

    // Determine Google Key: header from client takes precedence, then server env
    const clientGoogleKey = request.headers.get("x-goog-api-key") || "";
    const serverGoogleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    const effectiveGoogleKey = clientGoogleKey.trim() || serverGoogleKey.trim();

    // Determine Meta Key:
    const authHeader = request.headers.get("authorization") || "";
    const clientMetaKey = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";
    const serverMetaKey = process.env.META_API_KEY || "";
    const effectiveMetaKey = clientMetaKey.trim() || serverMetaKey.trim();

    // 1. Google AI Generation
    if (provider !== "meta" && effectiveGoogleKey) {
      // 1A. Attempt Native Multimodal Image Generation models (Nano Banana / Flash Image)
      const imageModels = ["gemini-nano-banana-2.1", "gemini-2.5-flash-image", "gemini-2.0-flash-exp"];
      for (const model of imageModels) {
        try {
          const nativeEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
            effectiveGoogleKey
          )}`;

          const nativeRes = await fetch(nativeEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${promptConfig.positivePrompt}\n\nStrict Negative Constraints (Must NOT appear): ${promptConfig.negativePrompt}`,
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
            const nativeData = await nativeRes.json();
            const candidateParts = nativeData.candidates?.[0]?.content?.parts || [];
            for (const part of candidateParts) {
              if (part.inlineData?.data) {
                const mime = part.inlineData.mimeType || "image/png";
                return NextResponse.json({
                  imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                  sourceLabel: `Google Gemini AI (${model})`,
                  style,
                });
              }
            }
          }
        } catch (nativeErr) {
          console.warn(`Native image model ${model} attempt error:`, nativeErr);
        }
      }

      // 1B. High-Fidelity Scene-Specific AI SVG Generation via Gemini 2.5 Flash / 2.0 Flash
      // Generates custom, gorgeous vector art depicting the actual story characters, landscapes, and themes!
      const geminiTextModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      for (const gemModel of geminiTextModels) {
        try {
          const svgEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${encodeURIComponent(
            effectiveGoogleKey
          )}`;

          const svgRes = await fetch(svgEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an authentic master Waldorf artist and educator.
Create a complete, visually breathtaking, valid SVG illustration for this story scene:
Scene Title: "${titleText}"
Scene Story: "${cleanPrompt}"
Art Technique Guidelines: ${promptConfig.svgInstruction}

Requirements:
1. Root element: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
2. Represent the scene visually: depict the sky, landscape, light source, nature elements, characters, or key story symbols.
3. Use rich layered SVG elements: <defs> with <linearGradient>, <radialGradient>, <filter> (e.g. gaussian blur for watercolor, turbulence for chalk grain), plus <path>, <ellipse>, <rect>, <polygon>.
4. Honor Waldorf pedagogy: warm living atmosphere, gentle soft forms, no harsh cartoon outlines, no modern fonts or text inside the image.
5. Do NOT include markdown code blocks or backticks. Output ONLY valid SVG XML.`,
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
              let svgContent = endIdx !== -1 ? rawText.substring(startIdx, endIdx + 6) : rawText.substring(startIdx) + "\n</svg>";
              const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
              return NextResponse.json({
                imageUrl: dataUrl,
                sourceLabel: `Google Gemini AI (${gemModel})`,
                style,
              });
            }
          }
        } catch (svgErr) {
          console.warn(`Gemini SVG generation with ${gemModel} error:`, svgErr);
        }
      }

      return NextResponse.json(
        { error: "Google AI generation completed without valid image data. Check key permissions or quota." },
        { status: 502 }
      );
    }

    // 2. Meta AI
    if (provider === "meta" && effectiveMetaKey) {
      return NextResponse.json(
        { error: "Meta image generation quota exhausted or not available. Please switch to Google API in Settings." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "No active Google API Key or Meta API Key found. Configure in Settings." },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
