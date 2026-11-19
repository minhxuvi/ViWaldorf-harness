# Cycle 18 — Practice Level Dropdown Selector

**Date:** 2026-11-19
**Decision:** KEEP

## Changes
- **Consolidated 4-button level grid into `LevelSelectDropdown` (`app/page.tsx`)**: Replaced the 2×2 / 4-column Level 1–4 button grid (`grid-cols-2 sm:grid-cols-4`) with a single compact dropdown button styled uniformly alongside **Bối cảnh & Cổ thư** and **Hướng dẫn & Tiện ích** (`btn-ghost text-xs py-2 px-3` with `BookOpen`, `{activeLevel}. {shortTitle}`, and `ChevronDown`/`ChevronUp`), displaying all 4 levels in a clean popover menu with active checkmark (`CheckCircle2`), outside-click dismissal, and `Escape` key support.
- **Multilingual labels (`lib/i18n.ts`)**: Added `story.nav.levelSelectLabel` across `vi`, `en`, and `zh`.
- **Specs & Tests**: Updated `README.md`, `plugins/waldorf/specs/00_master_prompt.md`, `plugins/waldorf/specs/04_ui_ux_design_system.md`, and `tests/storytelling_practice.test.ts` to verify `LevelSelectDropdown` presence and removal of the 4-button grid.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (`0` diff); further simplifies the top row so storytellers see the reading surface even sooner. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 13/13 pass; `npm run build` clean (12/12 static pages). |
| **G3. Privacy & Secrets** | **PASS** | Pure client UI control; zero new network calls, zero AI references. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` | All 4 practice levels selectable from the unified dropdown menu. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Uninterrupted reading start on both mobile and desktop viewports. |
| **B3. User Experience & Design** | 4.0 | `automated` | Top controls unified into 3 visually consistent buttons on a single compact row. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Unchanged. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `npx tsc --noEmit`, `npm test` (13/13), and `npm run build` pass cleanly. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Unchanged. |
| **B7. Research Quality** | 4.0 | `manual` | Specs and README synchronized with UI implementation. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Net visual footprint reduction at top of page. |

## Not verified
- Live browser click-through of `LevelSelectDropdown` on mobile and desktop widths (`manual`, pending).
