# 05 — Model Gateway

> Governed by [DAO.md](../../DAO.md).

## 1. Supported Ecosystem

The system follows a multi-provider model gateway architecture supporting both Google Generative AI and Meta AI/Muse:

### A. Google Generative AI (`GOOGLE_API_KEY`)
- `gemini-2.0-flash` / `gemini-2.5-flash`: Low-latency conversational guide, lesson planning, and Waldorf pedagogical assistance.
- **Multimodal Image Generation** (`gemini-2.0-flash-exp` / `imagen-3.0-generate-002`): Visual artwork generation calibrated with authentic Waldorf classroom prompt blueprints (`wet-on-wet`, `crayon`, `chalkboard`) and strict negative prompt constraints (no ink lines, no CGI, no text).
- **Scene-Specific SVG Vector Synthesis** (`gemini-2.5-flash` / `gemini-2.0-flash`): Scalable pedagogical SVG vector generation utilizing organic layered paths, multi-stop radial/linear gradients, and filter effects (`feGaussianBlur`, slate noise) matching Waldorf mediums.
- `gemini-1.5-flash`: Automatic fallback tier for chat and multimodal reasoning.

### B. Meta AI / Muse Architecture (`META_API_KEY`)
- `muse-wonder-1.0`: High-level orchestrator and pedagogical guide.
- `muse-spark-1.3`: Autonomous worker for code and markdown editing.
- `muse-image-1.0`: Visual artwork generation for Waldorf scenes.
- `muse-voice-transcribe-1.0`: Vietnamese speech-to-text with timestamps.

## 2. In-Browser Live Dictation & Local Fallback Seams

If neither `GOOGLE_API_KEY` nor `META_API_KEY` is provided, or when operating in offline/quota-exhausted environments:
- **Live Speech Dictation**: Uses native browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) for real-time live streaming transcription in Vietnamese (`vi-VN`) and English (`en-US`) with zero network latency.
- **Art Generation**: Reverts to local procedural SVG/Canvas rendering of Goethean watercolor washes, crayon wax textures, and chalkboard slates (`ProceduralIllustrator`).
- **Speech Metrics**: Reverts to client-side Web Audio API acoustic extraction (`WavAnalyzer`: 24kHz RMS loudness, dynamic range, pause ratio, WPM pace).
- **Dialect Rules**: Evaluated by local regex and token matching (`DialectAdaptationEngine`).
- **Story Feedback**: Evaluated by local pedagogical heuristics.
