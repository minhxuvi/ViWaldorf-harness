# Cycle 06 — Three Practice Levels (Full Story → Keywords → Free Recall)

**Date:** 2026-11-04
**Decision:** KEEP

## Change
- `StoryScene.passage?` (optional) plus `getScenePassage()`. Fallback order: passage → matching paragraph of the source text (lang-aware) → summary. No data migration.
- AI segmentation now asks for a verbatim `passage`. The local segmenter keeps full sentences as `passage`.
- Retelling Studio levels:
  - L1 shows the full scene passage.
  - L2 shows keyword chips only.
  - L3 hides text and keywords. The image is hidden by default and can be shown with one click. It hides again when the scene or level changes.
- Removed the "Peek prompt" toggle and the `.fading` CSS animation.
- Spec: `plugins/waldorf/specs/01_waldorf_pedagogy_and_art.md` § Three Practice Levels.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| G1 DAO (life, truth, privacy) | PASS | No new data collection. Passages come from local story text. |
| G2 Build | PASS | `automated`: `tsc --noEmit` 0 errors; `next build` clean |
| G3 Whitelist | PASS | Only specs, web source, results |

## Not verified
- `next lint`: the repo has no ESLint config, so the command opens an interactive setup prompt and does not lint. `unverified`
- Live UI check on Vercel: `manual`, pending user test.
