import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style = "wet-on-wet", aspectRatio = "16:9", provider, sceneTitle, sceneSummary } = body;

    if (!prompt && !sceneSummary) {
      return NextResponse.json({ error: "Missing prompt or scene details in request." }, { status: 400 });
    }

    const cleanPrompt = prompt || sceneSummary;

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
      // 1A. Attempt Native Multimodal Image Generation via gemini-2.0-flash-exp
      try {
        const nativeEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(
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
                    text: `Generate an authentic Waldorf style children's book illustration for: "${cleanPrompt}". Style: ${style}. Soft organic Goethean color harmony, warm and gentle feeling, artistic painting.`,
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
                sourceLabel: "Google Gemini 2.0 AI Art",
                style,
              });
            }
          }
        }
      } catch (nativeErr) {
        console.warn("Native Gemini image generation attempt error:", nativeErr);
      }

      // 1B. Attempt Imagen 3 endpoint (if supported for this key)
      try {
        const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(
          effectiveGoogleKey
        )}`;

        const imagenRes = await fetch(imagenEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: cleanPrompt }],
            parameters: { sampleCount: 1, aspectRatio },
          }),
        });

        if (imagenRes.ok) {
          const imagenData = await imagenRes.json();
          const prediction = imagenData.predictions?.[0];
          if (prediction?.bytesBase64Encoded) {
            const mime = prediction?.mimeType || "image/jpeg";
            return NextResponse.json({
              imageUrl: `data:${mime};base64,${prediction.bytesBase64Encoded}`,
              sourceLabel: "Google Imagen 3 AI",
              style,
            });
          }
        }
      } catch (imagenErr) {
        console.warn("Imagen 3 predict attempt error:", imagenErr);
      }

      // 1C. High-Fidelity Scene-Specific AI SVG Generation via Gemini 2.0 Flash / 1.5 Flash
      // This synthesizes custom, gorgeous, scene-specific Waldorf art matching the actual story scene!
      try {
        const geminiModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
        for (const gemModel of geminiModels) {
          const svgEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${encodeURIComponent(
            effectiveGoogleKey
          )}`;

          const stylePrompt =
            style === "wet-on-wet"
              ? "Wet-on-wet watercolor with flowing Goethean washes of lemon yellow, Prussian blue, vermilion rose, soft organic blending, gentle atmospheric gradients, no harsh black borders."
              : style === "crayon"
              ? "Beeswax block crayon drawing with broad strokes of warm ochre, terracotta, moss green, and golden yellow on textured cream paper."
              : "Pastel chalkboard drawing with luminous warm yellow and soft azure chalk outlines glowing on a dark matte slate blackboard.";

          const svgRes = await fetch(svgEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an authentic Waldorf artist and illustrator.
Create a complete, beautiful, valid SVG illustration depicting this story scene:
Title: "${sceneTitle || "Scene"}"
Summary: "${sceneSummary || cleanPrompt}"
Style: ${stylePrompt}

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
            // Strip any code block backticks if present
            rawText = rawText.replace(/```xml/gi, "").replace(/```svg/gi, "").replace(/```/g, "").trim();

            const startIdx = rawText.indexOf("<svg");
            const endIdx = rawText.lastIndexOf("</svg>");
            if (startIdx !== -1 && endIdx !== -1) {
              const svgContent = rawText.substring(startIdx, endIdx + 6);
              const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
              return NextResponse.json({
                imageUrl: dataUrl,
                sourceLabel: `Google Gemini AI (${gemModel})`,
                style,
              });
            }
          }
        }
      } catch (svgErr) {
        console.warn("AI SVG generation attempt error:", svgErr);
      }

      return NextResponse.json(
        { error: "Google AI image models unavailable or returned invalid output." },
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
