# 05 — Model Gateway

> Governed by [DAO.md](../../DAO.md).

## 1. Supported Ecosystem

The system follows a Meta AI / Muse first architecture:
- `muse-wonder-1.0`: High-level orchestrator and pedagogical guide.
- `muse-spark-1.3`: Autonomous worker for code and markdown editing.
- `muse-image-1.0`: Visual artwork generation for Waldorf scenes.
- `muse-voice-transcribe-1.0`: High-fidelity Vietnamese speech-to-text with timestamps.

## 2. Local Fallback Seams

If no `META_API_KEY` is provided, or when operating in offline environments:
- **Art Generation**: Reverts to local procedural SVG/Canvas rendering of watercolor washes, crayon wax textures, and chalkboard slates.
- **Speech Metrics**: Reverts to client-side Web Audio API acoustic extraction.
- **Dialect Rules**: Evaluated by local regex and token matching.
- **Story Feedback**: Evaluated by local pedagogical heuristics.
