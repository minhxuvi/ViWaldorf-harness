# Architectural Research Resources (Root Researcher)

> Focuses exclusively on minimalist Next.js runtime, safe static-CDN content loading, browser MediaRecorder playback, and client-side persistence.

## Research Verdicts

1. **Next.js 15 Single-Page Storytelling Studio**: `ADOPT`
   - Zero server routes, instant static/client rendering, zero external dependencies.
2. **Multi-CDN Repo Sync (`jsDelivr` + `raw.githubusercontent.com` fallback, 6h TTL, 6-concurrency cap)**: `ADOPT`
   - Prevents Fastly/GitHub Raw IP rate-limiting (`429`) and eliminates unnecessary 38-request bursts on every page load as well as 404 image polling when `imageGenerated === false`.
3. **Browser MediaRecorder & HTMLAudioElement (`<audio controls>`)**: `ADOPT`
   - Reliable native voice capture supporting `pause()` / `resume()` within a single continuous recording, accumulated active-segment timing (excluding paused gaps), cross-browser MIME fallback (`audio/webm;codecs=opus`, `audio/webm`, `audio/mp4`, `audio/ogg;codecs=opus`), and immediate local playback with zero network transfer and zero AI grading.
4. **Inline SVG Procedural Illustration (`ProceduralIllustrator`)**: `ADOPT`
   - Instant, deterministic, wordless Waldorf art rendering in 3 traditional mediums (Wet-on-Wet, Crayon, Chalkboard) across 12+ epic and folklore motifs without external image APIs.
5. **Remote AI & Cloud Sync**: `REJECT`
   - Removed to uphold minimalist single-purpose storytelling focus and 100% offline privacy.
