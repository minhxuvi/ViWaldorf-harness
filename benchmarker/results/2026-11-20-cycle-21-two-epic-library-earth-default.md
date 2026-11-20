# Cycle 21 — Two-Epic Library with Đẻ Đất Đẻ Nước as Default

**Date:** 2026-11-20
**Decision:** KEEP

## Changes
- Promoted **Đẻ Đất Đẻ Nước** (`xuvivn/de-dat-de-nuoc`) to the default story while retaining **Từ Sáng Thế Đến Giáng Sinh** (`xuvivn/from-genesis-to-nativity`) as a second story in the compact top control bar.
- Added a dual-repository loader, local repo bridge, story-and-language cache keying, story-aware reading progress, and Earth/Genesis source routing.
- Normalized the Earth Chinese locale to `locales/zh/`, updated its manifest and validation script, and verified the three locales with `vi=en?` / `en` / `zh` corpus checks.
- Updated Level 4 rendering and PDF export so Earth chapters with `image_generated=false` and no custom upload render no fake SVG/PNG image, while Genesis keeps its generated PNG and fallback behavior.
- Added browser and unit coverage for the Earth/Genesis seed, local repo bridge, variable chapter counts, and truthfulness rules.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unchanged (`0` diff); default Earth selection, browser-only Level 4 rendering, and local recording remain unhurried and non-punitive. |
| **G2. Truth in Evidence** | **PASS** | `automated`: Earth `vi`, `en`, and `zh` validators report 0 errors; Genesis cluster verification passes for all 28 PNGs; 15/15 tests pass; `npx tsc --noEmit` and production build pass. Earth images are honestly left blank where upstream `image_generated=false`. |
| **G3. Privacy & Secrets** | **PASS** | No AI routes/APIs or voice upload were added; story data and custom images remain local-first; MediaRecorder behavior remains in-browser only. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level |
|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` |
| **B3. User Experience & Design** | 4.0 | `automated` / live browser checked |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` / live browser checked |
| **B5. Technical Reliability & Build** | 4.0 | `automated` |
| **B6. Voice Recording & Playback** | 4.0 | `automated` |
| **B7. Research Quality** | 4.0 | `manual` |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` |

## Not Verified
- Live microphone capture in the browser remains manual verification; no sensitive personal audio was recorded or transmitted.
