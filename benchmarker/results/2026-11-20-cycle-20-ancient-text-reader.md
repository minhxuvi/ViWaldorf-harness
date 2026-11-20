# Cycle 20 — Dedicated Ancient Text Reader & Text-Scoped Recording

**Date:** 2026-11-20
**Decision:** KEEP

## Changes
- Added an edge-to-edge ancient-text reading mode in `app/page.tsx` that replaces the regular Level and context reading surface while a text is open.
- Reused the existing document scroll path and removed the legacy nested `max-h-96` text reader, keeping reading natural on mobile and desktop.
- Added ancient-text metadata to `VoiceRecording` and recorder capture labels. Ancient-text takes have an `ancientBookId`/`ancientBookTitle` and no Practice Level.
- Added localized reader/back/source copy in `vi`, `en`, and `zh`, and synchronized master/plugin/harness specs.
- Added wiring tests for the dedicated reader, text-scoped recorder metadata, and absence of Practice Levels for ancient-text takes.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unchanged (`0` diff); the reader simplifies visual framing and remains unhurried. |
| **G2. Truth in Evidence** | **PASS** | `automated`: strict TypeScript, 14/14 unit tests, and production build pass. Live ancient-text browser and microphone UX remain `manual`, pending. |
| **G3. Privacy & Secrets** | **PASS** | Existing in-browser `MediaRecorder`/`Blob` behavior remains unchanged; no recording upload or AI route was added. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level |
|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` / `manual` pending |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` |
| **B3. User Experience & Design** | 4.0 | `automated` / `manual` pending |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` |
| **B5. Technical Reliability & Build** | 4.0 | `automated` |
| **B6. Voice Recording & Playback** | 4.0 | `automated` / `manual` pending |
| **B7. Research Quality** | 4.0 | `manual` |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` |

## Not Verified
- Live mobile edge-to-edge reading and text selection.
- Live microphone capture, pause/resume, playback, and download while an ancient text is active.
