# Cycle 10 — Single-Story 180-Chapter Sync, Background Reading Separation & PDF Export

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Single-Story Focus & Removal of Unnecessary Options (`components/Shell.tsx`, `app/page.tsx`, `lib/types.ts`, `lib/store.tsx`, `lib/seedData.ts`)**:
  - Dedicated the entire application exclusively to `xuvivn/from-genesis-to-nativity` (*Từ Sáng Thế Đến Giáng Sinh*, 5 Books · 180 Chapters · 28 Illustrations, unified ages 9–10 Jakob Streit edition).
  - Removed the story selector dropdown, story file upload, manual add-story form, `segmentStoryLocally`, header library reset button, and age-group variant selectors (`3–5`, `6–10`, `11+`).
- **Updated 180-Chapter & 28-Illustration Repo Sync (`lib/repoStoryLoader.ts`, `lib/seedData.ts`, `lib/store.tsx`)**:
  - Updated `RepoStoryIndex` and Markdown parsers (`parseLevel0BookMarkdown`, `parseLevel1Markdown`, `parseLevel2Markdown`, `parseLevel3Markdown`) to match the updated 180-chapter and 28-cluster-illustration schema (`chapters`, `illustrations`, `### Chương X:`, `#### Lưu ý giọng kể`, and book-scoped Level 3 chapter keys `quyen-X-chuong-XX`).
  - Added schema validation in `fetchGenesisStoryFromRepo` so stale CDN responses without `chapters`/`illustrations` automatically fall back to `raw.githubusercontent.com`.
  - Upgraded `localStorage` cache key to `viwaldorf_storytelling_v4_genesis_180` and cleared legacy v1–v3 keys.
- **Level 0 Repurposed as Background & Story Soul Reading Section (`app/page.tsx`, `lib/i18n.ts`)**:
  - Storytelling practice tabs now focus on **Levels 1–4** (defaulting to Level 1).
  - Moved `level-0-khong-gian-boi-canh/` content (epic overview, cultural spirit, storytelling rhythm, metaphors, pronunciation guides, and 25 ancient reference texts) into an expandable **"Đọc thêm: Bối cảnh & Linh hồn câu chuyện"** reading panel.
- **Full-Text PDF Export with Level 4 Illustrations (`lib/pdfExporter.ts`, `app/page.tsx`)**:
  - Added local browser printable A4 HTML-to-PDF exporter (`buildFullStoryPrintableHtml` and `exportStoryToPdf`) covering cover page, table of contents, all 5 Books, all 180 Chapters (Level 1 text + vocal notes), and embedding all 28 Level 4 illustrations (repo PNG when `imageGenerated === true` with automatic SVG fallback, or `ProceduralIllustrator` SVG when `imageGenerated === false`).

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified (0 diff); unhurried oral storytelling focus with zero gamification or pressure. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 7/7 pass; `npm run build` clean static `/` (22.1 kB); live `fetchGenesisStoryFromRepo()` verified 5 books, 180 chapters (113,337 passage words), 28 illustrations (21 repo PNGs + 7 SVG fallbacks), and 796 KB PDF HTML with 28 figures. |
| **G3. Privacy & Secrets** | **PASS** | Zero AI API calls, zero API keys, zero `/api/*` endpoints; voice blobs and PDF generation execute strictly in browser. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth (Levels 1–4 + Context)** | 4.0 | `automated` | Full 180 chapters across Levels 1–3, 28 cluster illustrations at Level 4, and dedicated Context & Soul reading panel. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `manual` | Clean separation between preparation/context reading and active oral storytelling practice (Levels 1–4). |
| **B3. User Experience & Design** | 4.0 | `automated` | Streamlined single-story UI free of unused selectors, 4-tab layout defaulting to Level 1, and full-text PDF export action. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | 28 cluster illustrations with zero `<text>` elements across all 3 SVG mediums + gated repo PNGs. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | `tsc --noEmit` clean, `npm test` 7/7 pass, `next build` clean, schema-aware CDN fallback. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Updated dock counter for 180 chapters (Levels 1–3) and 28 illustrations (Level 4); live browser mic remains `manual`. |
| **B7. Research Quality** | 4.0 | `manual` | Updated `README.md`, `harness/specs/*`, and `plugins/waldorf/specs/*` ahead of implementation. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Removed unused multi-story and age-variant code; zero AI routes/clients; static `/` runtime. |

## Not verified
- Live browser `window.print()` PDF dialog flow, `MediaRecorder` microphone capture, and visual click-through: `manual` (pending live browser verification).
