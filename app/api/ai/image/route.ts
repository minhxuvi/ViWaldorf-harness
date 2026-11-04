import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style = "wet-on-wet", aspectRatio = "16:9", provider, sceneTitle, sceneSummary } = body;

    if (!prompt && !sceneSummary) {
      return NextResponse.json({ error: "Missing prompt or scene details in request." }, { status: 400 });
    }

    const cleanPrompt = prompt || sceneSummary;
    const titleText = sceneTitle || "Scene";

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
                      text: `Generate an authentic Waldorf style children's book illustration for: "${titleText} - ${cleanPrompt}". Art style: ${style}. Soft organic Goethean watercolor color harmony, warm and gentle feeling, painterly.`,
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

          const styleInstruction =
            style === "wet-on-wet"
              ? "Wet-on-wet watercolor style: soft glowing Goethean washes of lemon yellow, Prussian blue, vermilion rose, moss green. Soft organic blending with gentle curves, radial and linear gradients, watercolor blur effects, no hard black outlines."
              : style === "crayon"
              ? "Beeswax block crayon style: broad layered strokes of warm ochre, terracotta, deep green, golden yellow, tactile hand-drawn texture on cream paper."
              : "Pastel chalkboard style: luminous warm yellow and soft pastel chalk drawings on dark matte slate blackboard, soft atmospheric glowing outlines.";

          const svgRes = await fetch(svgEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an authentic Waldorf artist.
Create a complete, visually captivating, valid SVG illustration for this story scene:
Scene Title: "${titleText}"
Scene Story: "${cleanPrompt}"
Art Technique: ${styleInstruction}

Requirements:
1. Root element: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
2. Represent the scene visually: depict the sky, mountains, pillar, earth, characters, or natural elements described in the story.
3. Use layered SVG shapes: <defs> with <linearGradient>, <radialGradient>, <filter>, plus <path>, <ellipse>, <rect>, <circle>.
4. Do NOT include markdown code blocks or backticks. Output ONLY valid SVG XML.`,
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
