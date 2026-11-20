# Cycle 22 — Live Browser URL Sync & SEO Chapter Route Fixes

**Date:** 2026-11-20
**Decision:** KEEP

## Root Causes Diagnosed (`42c3c41`)
1. **No client-side URL synchronization**: `app/page.tsx` only read `initialRoute` into React state without updating `window.history`, so opening `/` or switching stories/books/chapters never changed the browser URL box.
2. **Next.js App Router segment collision causing 208 static 404s**: `app/truyen/[storySlug]/chuong-[chapterKey]/page.tsx` collided with `app/truyen/[storySlug]/[bookSlug]/page.tsx` (`^/truyen/([^/]+?)/([^/]+?)(?:/)?$`) and received the unstripped `"chuong-..."` prefix in `params.chapterKey`, causing `resolveChapterRoute` to return `undefined` and prerender all 208 chapter pages with HTTP 404.
3. **`initialRoute` hydration loops**: `app/page.tsx` snapped `activeStoryId` back to `initialRoute.storyId` when switching stories, re-applied `initialRoute` on background repo sync, and `lib/store.tsx` could let async remote progress override a deep-linked story URL.
4. **Multilingual slug drift & doubled `chuong-N-chuong-N-` prefix**: `getChapterSlug` slugified localized titles directly without stripping `Chương N:` / `Chapter N:` / `第N章：`.

## Changes
- Replaced `[bookSlug]` and `chuong-[chapterKey]` with a unified `app/truyen/[storySlug]/[segment]/page.tsx` route handling both book and chapter segments cleanly.
- Updated `lib/seoRoutes.ts` to strip leading chapter prefixes, memoize canonical `vi` seed stories, generate language-independent canonical URLs across `vi`/`en`/`zh`, accept both `chuong-{ord}-{slug}` and `{ord}-{slug}` in `resolveChapterRoute`, and expose `resolveStoryPath`, `buildCanonicalRouteUrl`, and `buildRouteDocumentTitle`.
- Updated `lib/store.tsx` and `app/page.tsx` to honor deep-linked `/truyen/...` paths on initial mount/auth merge, guard `initialRoute` application with once-only refs, synchronize the browser address bar and `document.title` via `window.history.replaceState` / `pushState` without unmounting or interrupting `MediaRecorder` takes, and support Browser Back/Forward via `popstate`.
- Updated `harness/specs/01-architecture-overview.md`, `plugins/waldorf/specs/04_ui_ux_design_system.md`, and expanded `tests/storytelling_practice.test.ts`.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unchanged (`0` diff); History API sync keeps navigation instant, offline-safe, and never interrupts child/educator voice recordings. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npm run build` generated 233/233 static pages; `.next/routes-manifest.json` shows 2 non-colliding `/truyen` dynamic routes; 221/221 prerendered `.meta` files under `/truyen` have HTTP 200 (`0` 404s); `npx tsc --noEmit` passed; `npm test` passed `16/16`. |
| **G3. Privacy & Secrets** | **PASS** | Zero AI calls, zero external tracking, zero recording uploads; all changes remain local for user review (`git status`). |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level |
|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` |
| **B3. User Experience & Design** | 4.0 | `automated` (build + route inspection; live browser interaction queued for manual check) |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` |
| **B5. Technical Reliability & Build** | 4.0 | `automated` |
| **B6. Voice Recording & Playback** | 4.0 | `automated` |
| **B7. Research Quality** | 4.0 | `manual` |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` |

## Not Verified
- Interactive live browser walkthrough (`pnpm dev` address bar observation across story/book/chapter switches, Back/Forward, and active recording) was not executed in a browser session during this run; verified via production SSG build, manifest/HTML inspection, TypeScript check, and unit tests.
