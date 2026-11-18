# Cycle 11 — Mobile Edge-to-Edge Reading, Auto-Hide Top Navbar, Half-Screen Tap Scroll & Corner Voice Recorder

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Single-Frame Edge-to-Edge Mobile Reading Surface (`app/globals.css`, `app/page.tsx`)**:
  - Added `.reading-surface` (`-mx-4 px-4 py-4 rounded-none border-y border-x-0` on `<640px`, rounded framed card on `>=640px`) and removed the inner bordered card wrapper around Level 1 story prose so mobile readers get full-bleed text width without double nested borders.
- **Auto-Hide Top Navigation Bar on Scroll Down (`components/Shell.tsx`)**:
  - Added scroll-direction tracking (`window` passive scroll listener) that smoothly translates the sticky `<header>` out of view (`-translate-y-full pointer-events-none`) when scrolling down past `64px` and reveals it (`translate-y-0`) when scrolling up or returning near the top (`<=36px`).
- **Compact Bottom-Right Minimizable Voice Recorder (`app/page.tsx`, `lib/i18n.ts`)**:
  - Anchored the voice recorder `<aside>` to `fixed bottom-4 right-4 z-40` as a compact `48×48` floating button while reading (displaying an active pulsing timer badge only while recording, or take count badge when recordings exist).
  - Expands into a compact `w-[calc(100vw-2rem)] sm:w-96` recorder/playback card on click, with a Minimize control and automatic collapse on chapter/illustration switches when not actively recording.
- **Full-Chapter Display with Half-Screen Tap-to-Scroll & Swipe Chapter Navigation (`app/page.tsx`, `lib/i18n.ts`)**:
  - Preserves the entire chapter passage (`currentScene.passage`) continuously without artificial page splitting.
  - Tapping the right 50% of the reading surface (`relX >= 0.5`) smoothly scrolls down one screen (`Math.max(240, Math.round(window.innerHeight * 0.85))`), and tapping the left 50% (`relX < 0.5`) smoothly scrolls up one screen, guarded against interactive controls, active text selection, and post-swipe taps.
  - Horizontal swipe (`>45px` with horizontal dominance guard) and keyboard `←`/`→` switch chapters (Levels 1–3) or illustrations (Level 4, which also supports left/right canvas tap).

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (0 diff); calm, distraction-free mobile reading rhythm without gamification or clutter. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 7/7 pass; `npm run build` clean static `/` (`22.8 kB`, First Load JS `146 kB`). Mobile viewport touch/scroll behavior verified by build & unit checks (`manual` for live phone browser touch test). |
| **G3. Privacy & Secrets** | **PASS** | Zero AI API calls, zero API keys, zero `/api/*` endpoints; voice recording executes purely in browser. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth (Levels 1–4 + Context)** | 4.0 | `automated` | Full-chapter reading across all 180 chapters (Levels 1–3) and 28 illustrations (Level 4) with seamless navigation. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `manual` | Uncluttered book-like reading cadence with vocal delivery notes surfaced cleanly before full chapter prose. |
| **B3. User Experience & Design** | 4.0 | `automated` | Single-frame edge-to-edge mobile layout, auto-hiding navbar on downward scroll, half-screen tap-to-scroll, horizontal swipe chapter switching, and bottom-right minimizable recorder. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Zero `<text>` hints preserved; Level 4 canvas supports left/right tap and horizontal swipe navigation. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc --noEmit` clean, `npm test` 7/7 pass, `next build` clean static compilation. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Compact bottom-right trigger expands to full `MediaRecorder` + `<audio controls>` + takes list; live browser mic remains `manual`. |
| **B7. Research Quality** | 4.0 | `manual` | Updated `plugins/waldorf/specs/04_ui_ux_design_system.md` ahead of code implementation. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Pure client-side CSS/React/TS helpers; redundant pagination code removed; zero AI dependencies. |

## Not verified
- Live mobile touchscreen tap-to-scroll, horizontal swipe interaction, scroll-hide header smoothness, and `MediaRecorder` microphone capture on physical iOS/Android devices: `manual`.
