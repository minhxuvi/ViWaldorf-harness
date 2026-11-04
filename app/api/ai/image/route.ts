import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style, aspectRatio = "16:9", provider } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt in request." }, { status: 400 });
    }

    // Determine Google Key: header from client takes precedence, then server env
    const clientGoogleKey = request.headers.get("x-goog-api-key") || "";
    const serverGoogleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    const effectiveGoogleKey = clientGoogleKey.trim() || serverGoogleKey.trim();

    // Determine Meta Key:
    const authHeader = request.headers.get("authorization") || "";
    const clientMetaKey = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";
    const serverMetaKey = process.env.META_API_KEY || "";
    const effectiveMetaKey = clientMetaKey.trim() || serverMetaKey.trim();

    // 1. Google Imagen 3
    if (provider !== "meta" && effectiveGoogleKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(
          effectiveGoogleKey
        )}`;

        const googleRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio,
            },
          }),
        });

        if (googleRes.ok) {
          const googleData = await googleRes.json();
          const prediction = googleData.predictions?.[0];
          const b64 = prediction?.bytesBase64Encoded;
          const mime = prediction?.mimeType || "image/jpeg";

          if (b64) {
            return NextResponse.json({
              imageUrl: `data:${mime};base64,${b64}`,
              sourceLabel: "Google Imagen 3 AI",
              style,
            });
          }
        }

        const errJson = await googleRes.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `Google Imagen error status ${googleRes.status}`;
        console.warn("Google Imagen API error:", errMsg);
        return NextResponse.json(
          { error: errMsg, details: errJson.error },
          { status: googleRes.status >= 400 && googleRes.status < 600 ? googleRes.status : 500 }
        );
      } catch (googleErr: any) {
        console.warn("Google Imagen fetch error:", googleErr);
        return NextResponse.json(
          { error: "Failed to connect to Google Imagen API: " + googleErr.message },
          { status: 502 }
        );
      }
    }

    // 2. Meta AI
    if (provider === "meta" && effectiveMetaKey) {
      // If Meta endpoint is configured
      return NextResponse.json({
        error: "Meta image generation quota exhausted or not available. Please switch to Google API in Settings.",
      }, { status: 429 });
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
