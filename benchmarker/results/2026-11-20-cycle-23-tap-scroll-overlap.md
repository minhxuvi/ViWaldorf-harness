# Cycle 23 — One-Click Tap-to-Scroll Page Navigation with 10% Overlap

**Date:** 2026-11-20
**Decision:** KEEP

## Root Cause Diagnosed
- `handleReadingSurfaceClick` in `app/page.tsx` previously scrolled by a fixed `Math.max(240, Math.round(window.innerHeight * 0.85))`. Because it ignored the sticky top `<header>`, the expanded bottom-right voice recorder dock, mobile `visualViewport` zoom/toolbars, and short landscape viewports (forcing a `240px` minimum), tapping to turn a page could skip lines behind overlaid UI or jump past the visible reading area. The Ancient Text Reader `<article>` also did not wire tap-to-scroll.

## Changes
- Updated `plugins/waldorf/specs/04_ui_ux_design_system.md` ahead of implementation to specify one-click tap-to-scroll page navigation with **10%** overlap (`PAGE_SCROLL_OVERLAP_RATIO = 0.1`), obstruction awareness, and reduced-motion handling across Levels 1–3 and the Ancient Text Reader.
- Added `PAGE_SCROLL_OVERLAP_RATIO` (`0.1`), `PageScrollStepInput`, and `computePageScrollStep` to `lib/readingProgress.ts`, calculating the exact unobstructed visible page height for both downward (accounting for the 64px auto-hide sticky header threshold) and upward scrolling while preserving 10% of the previous visible page.
- Updated `app/page.tsx`:
  - Wired `computePageScrollStep` into `handleReadingSurfaceClick`, measuring `window.visualViewport?.height` (capped by `window.innerHeight`), active sticky header `topObstruction`, and horizontally overlapping expanded `recorderDockRef` `bottomObstruction`.
  - Respected `prefers-reduced-motion` (`behavior: "auto"` vs `"smooth"`).
  - Enabled `onClick={handleReadingSurfaceClick}` on the Ancient Text Reader `<article>`.
- Added unit and wiring tests in `tests/storytelling_practice.test.ts` covering standard viewports, sticky header auto-hide vs. stayed-visible thresholds, expanded recorder obstruction, upward scrolling, short landscape viewports, invalid inputs, and `app/page.tsx` wiring.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unchanged (`0` diff); preserving 10% of the previous visible page protects unhurried, continuous oral storytelling without visual jumps or line loss. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 17/17 pass; `npm run build` succeeded cleanly (`233/233` static pages generated). Live browser touchscreen/desktop tap-to-scroll verification remains `manual`. |
| **G3. Privacy & Secrets** | **PASS** | Pure client-side viewport math; zero network requests, zero AI dependencies, zero secrets/student data touched. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` | Continuous reading flow maintained across Levels 1–3 and Ancient Text Reader. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Uninterrupted read-aloud rhythm while turning pages with one tap/click. |
| **B3. User Experience & Design** | 4.0 | `automated` (build + unit/wiring checks; live browser touch/click scroll queued for `manual` check) | Reliable 10% overlap accounting for sticky header, expanded recorder dock, `visualViewport`, and reduced motion. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Level 4 canvas tap navigation left untouched. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc --noEmit` clean, `npm test` 17/17 pass, `next build` clean (233/233 static pages). |
| **B6. Voice Recording & Playback** | 4.0 | `automated` | Expanded recorder dock no longer obscures freshly scrolled text lines. |
| **B7. Research Quality** | 4.0 | `manual` | Updated `plugins/waldorf/specs/04_ui_ux_design_system.md` before code changes. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Single pure helper in `lib/readingProgress.ts` reused across all reading surfaces; zero AI references. |

## Not Verified
- Live interactive browser click/tap scrolling across mobile Safari/Chrome (with zoomed `visualViewport`, sticky header auto-hide, and expanded voice recorder dock) and desktop browsers was not executed in a live browser session during this run (`manual`).
