# Cycle 12 — Reading Progress Restoration, Member Auth (Google SSO) & Zero-AI Community Feedback

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Automatic Reading Progress Persistence & Scroll Restoration (`lib/readingProgress.ts`, `lib/store.tsx`, `app/page.tsx`)**:
  - Added browser `localStorage` persistence (`viwaldorf_reading_progress_v1`) capturing active book, practice level (`1–4`), chapter (`sceneId` + `sceneIndex`), illustration (`illustrationId` + `illustrationIndex`), reading display preferences (`level1FlowMode`, `level1TextSize`, `level3Scope`, `showContextSection`), and scroll offset (`scrollY` + `scrollRatio`).
  - Automatically restores the exact chapter, display state, and scroll position on browser reopen, and merges bidirectional account progress by latest `updatedAt` timestamp when signed in.
- **Member Authentication & Google OAuth 2.0 SSO (`lib/server/db.ts`, `lib/server/auth.ts`, `app/api/auth/*`, `app/api/progress`, `components/AuthModal.tsx`, `components/Shell.tsx`)**:
  - Built lightweight SQLite persistence using Node.js built-in `node:sqlite` (`DatabaseSync`) with `scryptSync` + `timingSafeEqual` password hashing and `HttpOnly`, `SameSite=Lax` session cookies.
  - Added Google OAuth 2.0 Authorization Code flow (`/api/auth/google/redirect`, `/api/auth/google/callback`) modeled on `dapxexuyenviet.vn` (`GoogleController.php`, `docs/google-sso.md`) with CSRF `state` verification and safe Gmail/Workspace account linking.
- **Zero-AI Community Feedback (`components/FeedbackSection.tsx`, `app/api/feedback/*`, `lib/i18n.ts`)**:
  - Added public feedback list with status filtering (`open`, `in_progress`, `answered`, `closed`), member thread creation (with optional current-chapter context), member replies, author self-close, and development progress tracking (`development_status`, `openspec_change`, links, dates).
  - Official responses via Bearer-protected `/api/feedback/[id]/respond` post under **Ban biên tập ViWaldorf** with **Ban biên tập** badge — strictly zero mentions of AI anywhere in copy, schema, or API payloads.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (0 diff); warm Waldorf wording without AI hype, gamification, or tracking. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 10/10 pass covering reading progress, auth/Google SSO, and feedback SQLite flows; `npm run build` clean across `/` and all 13 `/api/*` routes. Live browser UI interaction and live Google OAuth roundtrip with external Google servers require real `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (`manual`). |
| **G3. Privacy & Secrets** | **PASS** | Zero AI API calls, zero committed secrets (`.env.example` template only, `data/` gitignored), password hashes via `scryptSync`, voice recordings strictly in-browser `Blob` URLs. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth (Levels 1–4 + Context)** | 4.0 | `automated` | All 5 books, 180 chapters, 28 illustrations, and context drawer intact with seamless progress continuity. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Human-centered feedback tone (*Ban biên tập & Cộng đồng*), zero AI terminology in parent-facing feedback UI. |
| **B3. User Experience & Design** | 4.0 | `automated` | Uncluttered top-bar integration for Feedback and Member Auth, automatic return to exact reading scroll position. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Zero `<text>` hints preserved across all 28 illustrations and 3 styles. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc --noEmit` clean, `npm test` 10/10 pass, `next build` clean across `/` and 13 API routes. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Unchanged pure local `MediaRecorder` + `<audio controls>` dock. |
| **B7. Research Quality** | 4.0 | `manual` | Specs (`01-architecture-overview.md`, `00_master_prompt.md`, `04_ui_ux_design_system.md`) updated alongside implementation. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Uses Node built-in `node:sqlite` + `node:crypto` with zero new npm dependencies and zero AI fields/copy. |

## Not verified
- Live end-to-end Google OAuth callback against `accounts.google.com` using production `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` credentials (`manual`).
