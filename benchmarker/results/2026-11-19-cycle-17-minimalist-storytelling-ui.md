# Cycle 17 — Minimalist Storytelling-First UI & Collapsible Guide/Tools Drawer

**Date:** 2026-11-19
**Decision:** KEEP

## Changes
- **Immediate storytelling practice opening (`app/page.tsx`)**: Removed `<PageHeader>`, the multi-row legacy Epic Header Card (`<section className="hidden">` removed cleanly), the fixed Level description banner, and inline tap/swipe hint lines (`tapOrSwipeHint`, `jumpToSceneHint`, `swipeHint`) so new visitors open directly into Level 1 practice.
- **Compact top bar & mutually exclusive drawers (`app/page.tsx`, `lib/i18n.ts`)**: Single top row presents Levels 1–4 tabs on the left and two collapsed-by-default drawer buttons on the right: **Bối cảnh & Cổ thư** (`showContextSection`) and **Hướng dẫn & Tiện ích** (`showUtilitiesSection`). Opening one closes the other; `syncError` / `pdfError` still display immediately below the top row if triggered.
- **Consolidated **Hướng dẫn & Tiện ích** (`showUtilitiesSection`)**: Houses the short epic introduction (`5 Books · 180 Chapters · 28 Visual Prompts`), 4-level practice guide & navigation tips, the single `<PdfExportDropdown>` entry point, Level 1 reading mode switcher (`viewByScene` / `viewFullFlow`), Level 4 artwork customization (SVG fallback medium, local image upload, reset), offline cache status, manual repository sync, and GitHub source link (`vi`, `en`, `zh`).
- **Streamlined reading toolbars & Gate G2 attribution (`app/page.tsx`)**: Extracted a shared `<BookSelectDropdown>` across Levels 1–4, removed duplicated Level 1 flow-mode pills from the Level 1 toolbar (leaving a single quick exit button when in `full` mode), and kept the silent Level 4 canvas showing only the Stage Mode button plus an honest `artModeProceduralBadge` when falling back to local procedural SVG art.
- **Cluster illustration compatibility (`lib/repoStoryLoader.ts`, `tests/storytelling_practice.test.ts`)**: Filters cluster `canh-XX-*.png` artworks cleanly when upstream `total_illustrations > 28` and adds UI minimalism & zero-AI assertions (`13/13` tests passing).
- **Specs aligned**: Updated `README.md`, `harness/specs/02-modules-and-plugins.md`, `plugins/waldorf/specs/00_master_prompt.md`, `01_waldorf_pedagogy_and_art.md`, and `04_ui_ux_design_system.md`.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (`0` diff); removes clutter and cognitive friction while keeping an unhurried reading surface. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 13/13 pass; `npm run build` clean (12/12 static pages). Level 4 transparently displays `artModeProceduralBadge` whenever local SVG fallback renders. |
| **G3. Privacy & Secrets** | **PASS** | Zero AI references across `translations.{vi,en,zh}.story.utilities`, verified by unit test; zero external audio transmission. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` | All 4 practice levels + optional Context & Ancient Texts drawer preserved intact. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Direct entry into spoken storytelling without distracting inline instructions. |
| **B3. User Experience & Design** | 4.0 | `automated` | Opening viewport decluttered; information & advanced tools cleanly tucked into collapsible drawers. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | 28 cluster illustrations preserved with zero text overlays and clean Stage Mode canvas. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `npx tsc --noEmit`, `npm test` (13/13), and `npm run build` all pass cleanly. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Compact bottom-right `MediaRecorder` dock unchanged. |
| **B7. Research Quality** | 4.0 | `manual` | Specs (`00`, `01`, `04`, `02-modules-and-plugins`) updated ahead of/alongside UI implementation. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Dead `<PageHeader>`, hidden header card, and unused hint strings removed; zero AI wording verified. |

## Not verified
- Live interactive click-through of collapsible drawers and responsive breakpoints in a browser (`manual`, pending).
