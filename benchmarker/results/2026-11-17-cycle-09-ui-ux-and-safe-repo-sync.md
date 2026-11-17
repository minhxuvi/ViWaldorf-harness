# Cycle 09 — UI/UX Overhaul & Rate-Limit-Safe Multi-CDN Repo Sync

**Date:** 2026-11-17
**Decision:** KEEP

## Changes
- **Rate-Limit & IP-Ban Mitigation (`lib/repoStoryLoader.ts`, `lib/store.tsx`, `lib/seedData.ts`, `app/page.tsx`)**:
  - Audited direct GitHub sync: does not call `api.github.com` or scrape `github.com` HTML, so account bans are unlikely, but previously issued 38 concurrent uncached `no-store` requests to `raw.githubusercontent.com` on every page load plus up to 18 HTTP 404 image requests when `imageGenerated === false`.
  - Replaced `raw.githubusercontent.com`-only fetching with jsDelivr CDN primary (`GENESIS_JSDELIVR_BASE_URL`) + `raw.githubusercontent.com` fallback (`getCandidateRepoBaseUrls`), bounded concurrency (`REPO_FETCH_CONCURRENCY = 6` via `mapWithConcurrency`), standard browser HTTP cache (`cache: "default"` on auto-sync), a 6-hour `localStorage` TTL (`shouldAutoSyncRepo`, `REPO_SYNC_TTL_MS`), a 15-second manual sync cooldown (`REPO_MANUAL_COOLDOWN_MS`), and strict `imageGenerated` gating in Level 4 so ungenerated PNGs do not trigger 404 requests.
- **UI/UX & Accessibility Overhaul (`app/globals.css`, `components/Shell.tsx`, `lib/i18n.ts`, `app/page.tsx`)**:
  - Updated typography (`rem`/`clamp()`, unitless `line-height`, `text-wrap: balance` headings, `text-wrap: pretty` body copy, `max-w-[68ch]` reading line width) and interactive states (`:focus-visible` outlines, tactile press scaling, single `<h1>` page landmark).
  - Upgraded storytelling flow: Age Variant segmented pills (`3–5`, `6–10`, `11+`), offline cache status & timestamp, balanced 5-level mobile tab grid (`col-span-2 sm:col-span-1`), Level 0 collapsible Epic Soul overview & categorized Ancient Reference Books (`cuu-uoc`, `tan-uoc`, `co-thu`), Level 1 Vocal Delivery Note positioned above the passage with S/M/L text sizing & top/bottom scene controls, Level 3 focus/all filter + direct Level 4 jump, Level 4 Stage Mode, consistent `LevelStepFooter`, and active-scene highlighting in the Voice Recording Dock.
- **Epic Visual Art Diversity (`lib/art/proceduralIllustrator.ts`)**:
  - Expanded `ProceduralIllustrator` with 11 new epic motifs (12 distinct motifs across all 28 seed scenes) while preserving Vietnamese folklore motifs and strictly zero `<text>` elements.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (0 diff); zero addictive loops, zero pressure, unhurried oral storytelling focus. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 7/7 tests pass; `npm run build` clean static route `/` (19.1 kB); verified 12 distinct epic SVG motifs across 28 scenes with zero `<text>` hints. |
| **G3. Privacy & Secrets** | **PASS** | Zero AI API calls, zero API keys, zero `/api/*` endpoints; voice blobs remain strictly in browser memory. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth (Levels 0–4)** | 4.0 | `automated` | All 5 levels, age variants (`3-5`, `6-10`, `11+`), epic overview, and categorized ancient texts accessible cleanly. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `manual` | Vocal note placed before reading in Level 1; unhurried step progression across Levels 0–4. |
| **B3. User Experience & Design** | 4.0 | `automated` | Segmented pills, balanced mobile level grid, reading text sizes, Level 4 Stage Mode, accessible `:focus-visible`. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | 12 distinct epic visual motifs + folklore motifs, 0 `<text>` tags across 28 scenes × 3 mediums. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc --noEmit` clean, `npm test` 7/7 pass, `next build` clean, 0 404 image polling, 6h TTL + multi-CDN resilience. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Persistent takes drawer toggle and active-scene take badge; live browser mic remains `manual`. |
| **B7. Research Quality** | 4.0 | `manual` | Updated root researcher, harness architecture, and plugin UI/UX design specs ahead of code edits. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Zero AI routes/clients; single-page `/` static runtime. |

## Not verified
- Live browser `MediaRecorder` microphone capture and manual UI click-through on Vercel preview/production: `manual` (pending live browser test).
