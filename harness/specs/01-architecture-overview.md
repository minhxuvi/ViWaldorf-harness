# 01 — Architecture Overview

> Governed by [DAO.md](../../DAO.md) and [AGENTS.md](../../AGENTS.md).

## 1. System Philosophy

ViWaldorf Harness is designed around three strict architectural principles:
1. **100% Local-First Execution & Zero AI**: All interactive features—4-level storytelling practice (Levels 1–4), optional Background & Story Soul reading drawer (`level-0-khong-gian-boi-canh/`), full-text PDF export with embedded Level 4 illustrations (`lib/pdfExporter.ts`), pure visual fallback SVG art (`ProceduralIllustrator`), and voice recording/playback (`MediaRecorder`)—execute completely inside the user's browser with zero AI models or APIs.
2. **Rate-Limit-Safe Single-Epic Repo Content Sync**: The application serves exclusively *Từ Sáng Thế Đến Giáng Sinh* (5 books, 180 chapters, 28 cluster illustrations, unified 9–10 age edition) loaded from `xuvivn/from-genesis-to-nativity` (`story-index.json` + 17 Markdown files across `level-0-*` .. `level-3-*`) via jsDelivr CDN (`cdn.jsdelivr.net`) with `raw.githubusercontent.com` fallback, bounded concurrency (max 6 parallel requests), a 6-hour `localStorage` sync TTL, a 15-second manual sync cooldown, and `imageGenerated` gating to prevent 404 image requests.
3. **Single-Focus Experience & Sacred Privacy**: The web application opens directly into the single-story Storytelling Practice Studio (`/`) with no story switcher, age-group selector, custom story upload form, or secondary modules. Voice recordings exist only as in-browser `Blob` object URLs (`<audio controls>`) and are never transmitted to any server.

## 2. Component Diagram

```mermaid
graph TD
    UI["Single-Story Storytelling Studio (app/page.tsx)"] --> STORE["React Context & LocalStorage + 6h TTL (lib/store.tsx)"]
    STORE --> LOADER["Rate-Limit-Safe Multi-CDN Loader (lib/repoStoryLoader.ts)"]
    STORE --> SEED["Bootstrap Seed for 5 Books · 180 Chapters · 28 Illustrations (lib/seedData.ts)"]
    UI --> ART["Gated Repo PNGs + Pure Visual SVG Fallback (lib/art/proceduralIllustrator.ts)"]
    UI --> PDF["Printable A4 HTML/PDF Exporter with Level 4 Art (lib/pdfExporter.ts)"]
    UI --> MIC["Browser MediaRecorder & Audio Playback"]
```

## 3. Data Flow Guarantees

- **Zero AI & Zero Backend Endpoints**: No `/api/*` endpoints, no AI gateways, and no external telemetry. Only public read-only GET requests are issued to `cdn.jsdelivr.net` (with `raw.githubusercontent.com` fallback) when the 6-hour cache TTL expires or on user-triggered sync (15s cooldown). Never calls `api.github.com` or scrapes `github.com` HTML.
- **No Automated Evaluation**: Audio recording is purely for recording and listening back to one's own voice.
