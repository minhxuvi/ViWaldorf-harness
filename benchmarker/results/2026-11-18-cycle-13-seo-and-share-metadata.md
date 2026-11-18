# Cycle 13 — SEO & Share Metadata (Open Graph Image from Illustration 08)

**Date:** 2026-11-18
**Decision:** KEEP

## Changes
- **Metadata (`app/layout.tsx`, `lib/site.ts`)**: `metadataBase`, keyword-first title, ~155-char description, canonical, Open Graph (`website`, `vi_VN`), `twitter:card=summary_large_image`, `theme-color`, and JSON-LD (`WebSite` + `CreativeWork`, ages 9–10, free; no certification/GDPT claims).
- **Share image (`app/opengraph-image.jpg`, `app/twitter-image.jpg` + `.alt.txt`)**: 1200×630 JPEG (~240 KB) cropped with macOS `sips` from repo Illustration 08 (`canh-08-con-tau-noah-va-cau-vong-giao-uoc.png`, 896×1200). Chosen for gentle, child-safe imagery that survives landscape crop.
- **Icon (`app/icon.svg`)**: local procedural rainbow icon in app palette (labeled local).
- **Crawlers (`app/robots.ts`, `app/sitemap.ts`)**: allow `/`, disallow `/api/`; sitemap lists `/`.

## Gates
| Gate | Result | Evidence |
|---|---|---|
| **G1. DAO & Life Safety** | **PASS** | `DAO.md` unmodified; gentle child-safe share image; no hype copy. |
| **G2. Truth in Evidence** | **PASS** | `automated`: `npx tsc --noEmit` 0 errors; `npm test` 10/10 pass; `next build` clean with `/robots.txt`, `/sitemap.xml`, `/opengraph-image.jpg`, `/twitter-image.jpg`, `/icon.svg` static; `next start` + `curl` confirms all OG/Twitter tags, absolute `og:image` 1200×630, canonical, icon link, valid JSON-LD (`JSON.parse`). |
| **G3. Privacy & Secrets** | **PASS** | Zero new dependencies, zero tracking/analytics, no secrets. |

## Scoring (`B1–B8`, 0–4 scale)
| Dimension | Score | Evidence Level | Notes |
|---|---|---|---|
| **B1. Storytelling Depth** | 4.0 | `automated` | Unchanged. |
| **B2. Pedagogical & Cultural Quality** | 4.0 | `automated` | Honest audience (9–10) metadata, no certification claims. |
| **B3. User Experience & Design** | 4.0 | `automated` | Rich link previews and browser tab icon. |
| **B4. Pure Visual Art (Level 4)** | 4.0 | `automated` | Unchanged. |
| **B5. Technical Reliability & Build** | 4.0 | `automated` | tsc, tests, build clean. |
| **B6. Voice Recording & Playback** | 4.0 | `manual` | Unchanged. |
| **B7. Research Quality** | 4.0 | `manual` | `harness/specs/01-architecture-overview.md` updated. |
| **B8. Minimalism & Zero-AI Purity** | 4.0 | `automated` | Next.js file conventions only, zero new packages. |

## Not verified
- Live previews on Telegram/Zalo/Facebook and Google Rich Results after deployment (`manual`); Telegram may cache the old preview (refresh via `@WebpageBot`).
