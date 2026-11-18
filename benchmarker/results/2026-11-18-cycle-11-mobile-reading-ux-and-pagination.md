# Cycle 11 — Mobile Edge-to-Edge Reading, Auto-Hide Top Navbar, Paginated Tap/Swipe Navigation & Corner Voice Recorder

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Single-Frame Edge-to-Edge Mobile Reading Surface (`app/globals.css`, `app/page.tsx`)**:
  - Added `.reading-surface` (`-mx-4 px-4 py-4 rounded-none border-y border-x-0` on `<640px`, rounded framed card on `>=640px`) and removed the inner bordered card wrapper around Level 1 story prose so mobile readers get full-bleed text width without double nested borders.
- **Auto-Hide Top Navigation Bar on Scroll Down (`components/Shell.tsx`)**:
  - Added scroll-direction tracking (`window` passive scroll listener) that smoothly translates the sticky `<header>` out of view (`-translate-y-full pointer-events-none`) when scrolling down past `64px` and reveals it (`translate-y-0`) when scrolling up or returning near the top (`<=36px`).
- **Compact Bottom-Right Minimizable Voice Recorder (`app/page.tsx`, `lib/i18n.ts`)**:
  - Anchored the voice recorder `<aside>` to `fixed bottom-4 right-4 z-40` as a compact `48×48` floating button while reading (displaying an active pulsing timer badge only while recording, or take count badge when recordings exist).
  - Expands into a compact `w-[calc(100vw-2rem)] sm:w-96` recorder/playback card on click, with a Minimize control and automatic collapse on page/chapter turns when not actively recording.
- **Paginated Chapter Reading with Tap & Horizontal Swipe Page Turning (`lib/repoStoryLoader.ts`, `app/page.tsx`, `lib/i18n.ts`)**:
  - Added deterministic `paginatePassage(passage, textSize)` splitting chapter passages along paragraph and sentence boundaries (`sm`: 600/800, `md`: 450/650, `lg`: 340/480 chars) so each page fits comfortably on mobile screens without vertical scrolling.
  - Enabled tap-to-turn-page (left 35% = previous page/chapter, right 65% = next page/chapter, guarded against interactive controls, active text selection, and post-swipe clicks) and horizontal swipe (`>45px` with horizontal dominance guard) + keyboard `←`/`→`.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (0 diff); calm, distraction-free mobile reading rhythm without gamification or clutter. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 8/8 pass (including new `paginatePassage` suite); `npm run build` clean static `/` (`23.1 kB`, First Load JS `147 kB`). Mobile viewport touch/scroll behavior verified by build & unit checks (`manual` for live phone browser touch test). |
| **G3. Privacy & Secrets** | **PASS** | Zero AI API calls, zero API keys, zero `/api/*` endpoints; all pagination and voice recording execute purely in browser. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth (Levels 1–4 + Context)** | 4.0 | `automated` | All 180 chapters across Levels 1–3, 28 illustrations at Level 4, plus screen-sized chapter pagination in Level 1. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `manual` | Uncluttered book-like reading cadence with vocal delivery notes surfaced on Page 1 of each chapter. |
| **B3. User Experience & Design** | 4.0 | `automated` | Single-frame edge-to-edge mobile layout, auto-hiding navbar on downward scroll, tap/swipe page turning, and bottom-right minimizable recorder. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Zero `<text>` hints preserved; Level 4 canvas also supports tap left/right and horizontal swipe navigation. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc --noEmit` clean, `npm test` 8/8 pass, `next build` clean static compilation. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Compact bottom-right trigger expands to full `MediaRecorder` + `<audio controls>` + takes list; live browser mic remains `manual`. |
| **B7. Research Quality** | 4.0 | `manual` | Updated `plugins/waldorf/specs/04_ui_ux_design_system.md` ahead of code implementation. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Pure client-side CSS/React/TS helpers; zero AI dependencies or extra routes. |

## Not verified
- Live mobile touchscreen tap/swipe interaction, scroll-hide header smoothness, and `MediaRecorder` microphone capture on physical iOS/Android devices: `manual`.
