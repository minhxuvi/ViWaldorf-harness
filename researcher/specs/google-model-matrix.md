# Google Generative AI Model Matrix (2025–2026)

> Governed by [DAO.md](../../DAO.md). Researched for the ViWaldorf ecosystem.

## 1. Google AI Studio vs Vertex AI Separation

| Platform | Endpoint Base | Credential | Primary Target |
|---|---|---|---|
| **Google AI Studio (Gemini API)** | `https://generativelanguage.googleapis.com/v1beta/` | `AIzaSy...` API Key | Fast web deployments, direct browser/client calls, developer apps. |
| **Google Cloud Vertex AI** | `https://${LOCATION}-aiplatform.googleapis.com/v1/...` | Google Cloud ADC / OAuth2 | Dedicated enterprise infrastructure, Imagen 3 endpoints, private VPCs. |

## 2. Active Model Catalog

### A. Core Text, Reasoning & Code
- **`gemini-3.8-flash`**: Highest throughput, ultra-fast agentic tool execution, 1M token context.
- **`gemini-3.1-pro-preview`**: Next-generation frontier reasoning and deep architectural refactoring.
- **`gemini-2.5-pro`**: Complex logic, code generation with dynamic thinking budget.
- **`gemini-2.5-flash`**: High-volume balanced reasoning and production workhorse.
- **`gemini-2.5-flash-lite`**: Ultra-fast classification, summarization, and cost efficiency.
- **`gemini-2.0-flash`**: Mature production multimodal workhorse for web applications.

### B. Image & Visual Generation
- **Native Gemini Multimodal Generation**: `gemini-2.0-flash-exp` (or `gemini-3.x-image`) with `responseModalities: ["TEXT", "IMAGE"]`. Returns base64 image data under `inlineData`.
- **Scene-Specific Waldorf Vector Artwork**: `gemini-2.5-flash` or `gemini-2.0-flash` generating tailored `<svg>` Goethean washes matching story scenes.
- **Vertex AI Imagen 3**: `imagen-3.0-generate-002` (Note: Requires Google Cloud Vertex AI credentials; not available on consumer Google AI Studio endpoints).

### C. Audio & Voice Transcription
- **Native Browser Web Speech API**: `webkitSpeechRecognition` / `SpeechRecognition` in `vi-VN` / `en-US` for zero-network latency live transcription.
- **`gemini-2.0-flash` Multimodal Audio**: Accepts base64 PCM/WAV/MP3 chunks for direct ASR and acoustic semantic extraction.
- **`gemini-3.8-live`**: Bi-directional low-latency voice streaming.
