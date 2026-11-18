# Cycle 14 — Mobile & Cross-Browser Full-Story PDF Export (180 Chapters)

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Top-Level `@media print` Export Root (`lib/pdfExporter.ts`)**:
  - Replaced the hidden `0×0` `<iframe>` printing mechanism (`iframe.contentWindow.print()`) with an isolated top-level `#viwaldorf-print-root` container and `#viwaldorf-print-styles` stylesheet mounted directly on `document`.
  - `@media screen` keeps `#viwaldorf-print-root` invisible offscreen (`position: fixed; left: -20000px; opacity: 0; pointer-events: none`) while preloading images; `@media print` hides `body > *:not(#viwaldorf-print-root)` and restores full document flow so iOS Safari, iPadOS, Android Chrome, and desktop browsers export all **5 Books · 180 Chapters** instead of only printing the currently visible chapter.
  - Added explicit `font-weight: 700` heading rules and `list-style: decimal` for `.pdf-toc ol` to override Tailwind preflight resets inside the main document, and consolidated CSS/HTML builders so `buildFullStoryPrintableHtml` and `exportStoryToPdf` share one source of truth.
- **Full-Passage Sync Guard & Mobile Label Clarity (`lib/pdfExporter.ts`, `lib/store.tsx`, `lib/i18n.ts`, `app/page.tsx`)**:
  - Added `hasFullStoryPassages(story)` (`SEED_PASSAGE_PLACEHOLDER_MARKER` + `lastSyncedAt` + 180-chapter check) to prevent printing 1-sentence seed placeholders before repo sync finishes.
  - Updated `syncFromRepo` in `lib/store.tsx` to bypass the 15-second cooldown when `!hasFullStoryPassages(selectedStoryRef.current)` so forced pre-export sync always resolves cleanly, and surfaced `t.story.pdf.syncRequiredNotice` in `handleExportPdf` if offline/incomplete.
  - Replaced the bare `"PDF"` mobile label on Level 1 `PdfExportDropdown` with `"Tải PDF Toàn văn"` / `"Full Story PDF"` (`mobileShortBtn`) while preserving the 2-option menu (**Kèm ảnh** / **Không kèm ảnh**).
- **Specs & Tests (`harness/specs/01-architecture-overview.md`, `plugins/waldorf/specs/04_ui_ux_design_system.md`, `tests/storytelling_practice.test.ts`)**:
  - Documented `#viwaldorf-print-root` and `hasFullStoryPassages` in specs and added unit tests covering placeholder rejection, 180-chapter validation, and `@media print` isolation CSS.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (`0` diff); keeps strict 2-option full-story print export without unnecessary complexity. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 10/10 pass; `npm run build` clean static `/` (17.8 kB, 12/12 static pages). |
| **G3. Privacy & Secrets** | **PASS** | Zero new dependencies, zero external PDF APIs, 100% browser-local PDF printing. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` | Prevents exporting placeholder text; enforces full 180-chapter sync. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Preserves all 5 Books, 180 Chapters, vocal notes, and optional 28 Level 4 illustrations. |
| **B3. User Experience & Design** | 4.0 | `automated` | Fixes mobile iOS/Android single-chapter print bug and clarifies mobile Level 1 PDF button label. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Unchanged; 28 artworks embedded optionally in PDF. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc`, `npm test` (10/10), and `next build` all pass cleanly. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Unchanged. |
| **B7. Research Quality** | 4.0 | `manual` | Updated `harness/specs/01-architecture-overview.md` and `plugins/waldorf/specs/04_ui_ux_design_system.md`. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Shared print CSS/HTML builder, zero external PDF packages, zero AI. |

## Not verified
- Live physical iOS Safari / Android Chrome print-preview sheet page count (`manual`, pending post-deploy check on `https://waldorf.xuvi.vn`).
