# 05 — Model Gateway

> Governed by [DAO.md](../../DAO.md).

## 1. Supported Ecosystem

The system follows a model gateway architecture centered exclusively on Meta AI / Muse:

### Meta AI / Muse Architecture (`META_API_KEY`)
- `muse-wonder-1.0`: High-level orchestrator, lesson planning, and Waldorf pedagogical companion.
- `muse-spark-1.3`: Autonomous worker for code and markdown editing.
- `muse-image-1.0`: Visual artwork generation for Waldorf scenes (Goethean wet-on-wet watercolor, crayon drawing with beeswax crayons, and chalkboard pastel).
- `muse-voice-transcribe-1.0`: Regional dialect-aware Vietnamese speech-to-text with timestamps.

## 2. In-Browser Live Dictation & Local Fallback Seams

If `META_API_KEY` is not provided, or when operating in offline/local environments:
- **Live Speech Dictation**: Uses native browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) for real-time live streaming transcription in Vietnamese (`vi-VN`) and English (`en-US`) with zero network latency.
- **Art Generation**: Reverts to local procedural SVG/Canvas rendering of Goethean watercolor washes, crayon wax textures, and chalkboard slates (`ProceduralIllustrator`).
- **Speech Metrics**: Reverts to client-side Web Audio API acoustic extraction (`WavAnalyzer`: 24kHz RMS loudness, dynamic range, pause ratio, WPM pace).
- **Dialect Rules**: Evaluated by local regex and token matching (`DialectAdaptationEngine`).
- **Story Feedback**: Evaluated by local pedagogical heuristics (`DAO.md` compliant).
