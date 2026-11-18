# 01 — Architecture Overview

> Governed by [DAO.md](../../DAO.md) and [AGENTS.md](../../AGENTS.md).

## 1. System Philosophy

ViWaldorf Harness is designed around three strict architectural principles:
1. **100% Zero-AI Storytelling & Privacy-Respecting Sync**: All storytelling features—4-level storytelling practice (Levels 1–4), optional Background & Story Soul reading drawer (`level-0-khong-gian-boi-canh/`), full-text PDF export with embedded Level 4 illustrations (`lib/pdfExporter.ts`), pure visual fallback SVG art (`ProceduralIllustrator`), and voice recording/playback (`MediaRecorder`)—execute completely inside the user's browser with zero AI models or APIs. Voice recordings exist only as in-browser `Blob` object URLs (`<audio controls>`) and are never transmitted to any server.
2. **Rate-Limit-Safe Single-Epic Repo Content Sync**: The application serves exclusively *Từ Sáng Thế Đến Giáng Sinh* (5 books, 180 chapters, 28 cluster illustrations, unified 9–10 age edition) loaded from `xuvivn/from-genesis-to-nativity` (`story-index.json` + 17 Markdown files across `level-0-*` .. `level-3-*`) via jsDelivr CDN (`cdn.jsdelivr.net`) with `raw.githubusercontent.com` fallback, bounded concurrency (max 6 parallel requests), a 6-hour `localStorage` sync TTL, a 15-second manual sync cooldown, and `imageGenerated` gating to prevent 404 image requests.
3. **Reading Progress Restoration, Member Sign-In & Human Community Feedback**:
   - **Browser Progress Persistence**: The active book, practice level, chapter (`sceneId` + `sceneIndex`), illustration (`illustrationId` + `illustrationIndex`), reading display settings (`level1FlowMode`, `level1TextSize`, `level3Scope`, `showContextSection`), and scroll position (`scrollY` + `scrollRatio`) are saved in `localStorage` (`viwaldorf_reading_progress_v1`) and restored automatically when reopening the site in the same browser.
   - **Member Sign-In & Google SSO**: Optional Email/Password registration & sign-in plus Google OAuth 2.0 SSO (`/api/auth/*`) allow members to synchronize their reading progress across sessions via `/api/progress` and prepare for future member features.
   - **Zero-AI Community Feedback**: Public feedback threads (`/api/feedback/*`) enable parents and educators to share bug reports, content suggestions, and feature ideas without any AI branding, AI labels, or automated grading; official replies are authored by *Ban biên tập ViWaldorf*.

## 2. Component Diagram

```mermaid
graph TD
    UI["Storytelling Studio & Feedback View (app/page.tsx)"] --> STORE["React Context & LocalStorage + Sync (lib/store.tsx)"]
    STORE --> PROG["Reading Progress & Scroll Restoration (lib/readingProgress.ts)"]
    STORE --> LOADER["Rate-Limit-Safe Multi-CDN Loader (lib/repoStoryLoader.ts)"]
    STORE --> SEED["Bootstrap Seed for 5 Books · 180 Chapters · 28 Illustrations (lib/seedData.ts)"]
    UI --> ART["Gated Repo PNGs + Pure Visual SVG Fallback (lib/art/proceduralIllustrator.ts)"]
    UI --> PDF["Printable A4 HTML/PDF Exporter with Level 4 Art (lib/pdfExporter.ts)"]
    UI --> MIC["Browser MediaRecorder & Audio Playback"]
    UI --> FB["Zero-AI Community Feedback (components/FeedbackSection.tsx)"]
    HEADER["Shell Header & Auth Modal (components/Shell.tsx, AuthModal.tsx)"] --> AUTH_API["Next.js Route Handlers (/api/auth/*, /api/progress, /api/feedback/*)"]
    AUTH_API --> SQLITE["Local SQLite Store via node:sqlite (lib/server/db.ts)"]
```

## 3. Data Flow Guarantees

- **Zero AI**: Zero AI endpoints, zero AI API keys, and zero AI terminology in community feedback or storytelling flows.
- **Audio Sovereignty**: Voice recordings stay strictly in-browser (`Blob` URLs); never uploaded.
- **Session & OAuth Security**: Password hashing uses `crypto.scryptSync` with `crypto.timingSafeEqual`; sessions use `HttpOnly`, `SameSite=Lax` cookies; Google OAuth uses Authorization Code flow with CSRF `state` verification and verified email validation.
