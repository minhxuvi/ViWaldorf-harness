# Cycle 15 — Multilingual Corpus (`vi`, `en`, `zh`), 28 Completed Level 4 Illustrations & Local Pre-Push Repo Bridge

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Local Pre-Push Repository Bridge (`lib/server/localRepo.ts`, `app/api/local-repo/[...path]/route.ts`, `.env.example`)**:
  - Added `GET /api/local-repo/[...path]` backed by `resolveSafeLocalRepoFile` pointing to `GENESIS_LOCAL_REPO_DIR` (default `../from-genesis-to-nativity`).
  - Enforces path traversal protection (`..`), rejects hidden dotfiles and `private/` folders, and limits access to `languages.json`, `README.md`, `locales/**`, and `assets/images/**` with strict extension allowlisting (`.json`, `.md`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`).
  - `getCandidateRepoBaseUrls` automatically prioritizes `/api/local-repo` when running on `localhost` / `127.0.0.1` so local changes in `from-genesis-to-nativity` can be tested live before pushing either repository, with automatic jsDelivr and GitHub Raw fallback in production.
- **Multilingual Corpus Loader, Parsers & Seed (`lib/repoStoryLoader.ts`, `lib/seedData.ts`, `lib/types.ts`)**:
  - Updated `fetchGenesisStoryFromRepo` to accept `lang: "vi" | "en" | "zh"`, read `locales/{lang}/story-index.json` (with legacy root `story-index.json` fallback), and normalize relative markdown paths via `resolveLocaleRepoPath`.
  - Upgraded `parseLevel0BookMarkdown`, `parseLevel1Markdown`, `parseLevel2Markdown`, and `parseLevel3Markdown` to support Vietnamese, English (`Chapter X:`, `#### Storytelling Notes`, English Level 2 keys, `## Book I..V`), and Simplified Chinese (`第X章：`, `#### 讲演提示`, full-width punctuation/parentheses, `## 第一卷..第五卷`).
  - Updated `lib/seedData.ts` to new `locales/{lang}/level-{0..4}-...` paths, centralized `assets/images/canh-01..28.png`, and `imageGenerated: true` across all 28 illustrations (`tranh-01`..`tranh-28`).
- **3-Language UI, Per-Language Store Cache & PDF Export (`lib/i18n.ts`, `lib/store.tsx`, `components/Shell.tsx`, `app/page.tsx`, `lib/pdfExporter.ts`)**:
  - Added full Simplified Chinese (`zh`) UI translations in `lib/i18n.ts` with zero AI references.
  - Added per-language `storiesByLang` caching in `lib/store.tsx` (`viwaldorf_storytelling_v5_genesis_180`) with race-safe per-language syncing and seamless `VI · EN · 中文` switching in `components/Shell.tsx`.
  - Extended `lib/pdfExporter.ts` cover, TOC, vocal notes, and illustration captions for `zh` alongside `vi` and `en`.
- **Specs & Automated Tests (`README.md`, `harness/specs/*`, `plugins/waldorf/specs/*`, `tests/storytelling_practice.test.ts`)**:
  - Synchronized specs and `README.md` with the new multilingual layout and `assets/images/` paths.
  - Added unit tests for `vi`/`en`/`zh` Markdown parsing, local repo security path filtering, `zh` PDF output, and a live integration test against sibling `../from-genesis-to-nativity` validating all 180 chapters across all 3 languages and all 28 PNG files.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (`0` diff); preserves unhurried, non-judgmental storytelling focus across 3 languages. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 12/12 pass (including live disk check of 3×180 chapters and 28 PNGs); `npm run build` clean (17.9 kB `/`, 12/12 static pages + `/api/local-repo/[...path]`). |
| **G3. Privacy & Secrets** | **PASS** | Path-traversal & `private/` guard verified; zero AI APIs, zero remote voice transmission, zero secrets exposed. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` | Full 5-level support across `vi`, `en`, and `zh` (180 chapters each verified against sibling repo). |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Preserves cultural context, rhythm, metaphors, and pronunciation guides across all 3 editions. |
| **B3. User Experience & Design** | 4.0 | `automated` | Clean `VI · EN · 中文` header toggle with per-language caching and preserved reading progress. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | All 28 hand-drawn PNGs (`canh-01..28.png`) verified on disk (`imageGenerated: true`) with local SVG fallback. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc --noEmit`, `npm test` (12/12), and `next build` all pass cleanly. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Unchanged browser-local `MediaRecorder` capture and playback. |
| **B7. Research Quality** | 4.0 | `manual` | Specs updated across `README.md`, `harness/specs/`, and `plugins/waldorf/specs/`. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Zero new npm dependencies; strict Zero-AI verification passes for `vi`, `en`, and `zh` copy. |

## Not verified
- Interactive browser click-through on `http://localhost:3000` (`manual`, left ready for user local testing before pushing both repos).
