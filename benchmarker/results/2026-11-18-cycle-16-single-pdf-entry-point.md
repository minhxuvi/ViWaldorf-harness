# Cycle 16 — Single "Download Full Story PDF" Entry Point

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Removed duplicated PDF dropdown (`app/page.tsx`)**: The Level 1 toolbar rendered a second `PdfExportDropdown` identical to the one on the Epic Header Card (same handler, same full 180-chapter output). Removed the Level 1 copy; the header card selector (**Kèm ảnh** / **Không kèm ảnh**) remains, visible on every Level tab.
- **Simplified state & component**: `pdfMenuLocation: "header" | "level1" | null` + two refs → `isPdfMenuOpen: boolean` + one `pdfMenuRef`; dropped the `variant` prop and mobile-only label branch from `PdfExportDropdown`.
- **i18n (`lib/i18n.ts`)**: Removed unused `story.pdf.mobileShortBtn` in `vi`, `en`, `zh`.
- **Specs**: `plugins/waldorf/specs/00_master_prompt.md`, `01_waldorf_pedagogy_and_art.md`, `04_ui_ux_design_system.md`, `harness/specs/02-modules-and-plugins.md` now state PDF export is a single action on the Epic Header Card.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified; pure removal of redundant UI, no new requirements. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 12/12 pass; `npm run build` clean. |
| **G3. Privacy & Secrets** | **PASS** | No new dependencies, no network changes; PDF generation remains browser-local. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` | Unchanged. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Unchanged. |
| **B3. User Experience & Design** | 4.0 | `automated` | Level 1 toolbar decluttered to reading tools only; one clear PDF entry point. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Unchanged. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc`, `npm test` (12/12), `next build` pass. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Unchanged. |
| **B7. Research Quality** | 4.0 | `manual` | Specs aligned with UI. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Net code removal (state, ref, prop, i18n key). |

## Not verified
- Visual click-through of header PDF menu on mobile width (`manual`, pending).
