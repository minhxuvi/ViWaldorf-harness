# 04 — UI/UX Design System: The Warm Paper Palette

> Governed by [DAO.md](../../../DAO.md).

## 1. Color Palette

The interface reproduces the warmth, texture, and organic serenity of hand-crafted paper, botanical ink, and deep forest foliage:

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FDF8EE` | Primary warm paper page background |
| `--paper2` | `#F7ECD8` | Deepened parchment for headers and highlighted notes |
| `--card` | `#FFFDF7` | Elevated card surface |
| `--ink` | `#2B3A2E` | Deep charcoal-green ink for readable text |
| `--muted` | `#6B7A6E` | Softened ink for secondary notes and metadata |
| `--forest` | `#2F5D3A` | Living forest green for primary actions and accents |
| `--forest2` | `#1E4028` | Deep night forest for headings and active states |
| `--terra` | `#C45C4A` | Warm terracotta earth for highlights and recording actions |
| `--line` | `#E7DCC4` | Soft tactile border line |
| `--leaf-soft` | `#E3EFE0` | Gentle green fill for vocal/rhythm badges |
| `--sand-soft` | `#FDF0E6` | Warm sand fill for cultural context highlights |

## 2. Typography & Form

- **Headings**: Georgia, serif with `text-wrap: balance` and `clamp()` / `rem` sizing — evoking classic printed storybooks while honoring OS text scaling.
- **Body**: Clean system sans-serif with unitless `line-height: 1.6` and `text-wrap: pretty` on narrative blocks — high legibility across desktop and mobile without orphaned lines.
- **Accessibility & Tactile Feedback**: Clear `:focus-visible` forest outline rings (≥3:1 contrast) and gentle press scaling (`scale: 0.98`) on interactive controls.
- **Cards**: Rounded 14px–16px corners on desktop (`garden-card`), and single-frame edge-to-edge reading surfaces (`.reading-surface`) on mobile viewports (`-mx-4 px-4 rounded-none border-x-0 sm:mx-0 sm:p-6 sm:rounded-2xl sm:border`) without nested bordered text boxes, maximizing horizontal text width on phones.
- **Navigation**: Minimal top header bar (brand title, language toggle VI/EN) that auto-hides smoothly (`-translate-y-full`) when scrolling down past 64px to read and reappears (`translate-y-0`) when scrolling up or near the top of the page.

## 3. Single-Story Storytelling Studio & Voice Playback Dock

- **Focused Epic Header Card**: Displays *Từ Sáng Thế Đến Giáng Sinh* (`5 Quyển · 180 Chương · 28 Tranh minh họa`), book filter pills (`All` + `Book I–V`), offline-ready sync status, **Read More: Background & Story Soul** toggle, **Download Full Story PDF (with Level 4 Art)** button, and GitHub source chip. Zero story switcher, zero age-group selector, and zero story upload forms.
- **Background & Story Soul Reading Drawer (`level-0`)**: Dedicated expandable reading section with collapsible epic overview (`00-tong-quan-linh-hon-su-thi.md`), book-level Soul cards, pronunciation guide, and categorized Ancient Reference Library (`Tất cả`, `Kinh Cựu Ước`, `Kinh Tân Ước`, `Cổ Thư & Sử Truyền`).
- **4-Level Tactile Switcher**: Responsive step tabs (`Level 1` → `Level 4`, 2×2 mobile layout → 4-column desktop) defaulting to **Level 1**, with bottom Previous/Next level progression bars.
- **Level-Specific Ergonomics**:
  - **Level 1**: Edge-to-edge single-frame reading surface on mobile (`.reading-surface`, no inner bordered card around prose), vocal delivery note positioned before the full chapter prose, selectable reading text size (`S` / `M` / `L`), full-chapter continuous reading with tap-to-scroll-by-screen (tapping the right 50% of the reading surface smoothly scrolls down ~85% of viewport height; tapping the left 50% smoothly scrolls up ~85% of viewport height), horizontal swipe / keyboard `←` `→` navigation to switch chapters (`1..180` or filtered by book), and quick link to the chapter's Level 4 cluster illustration + PDF export action.
  - **Level 2**: Single-frame `.reading-surface` structured chapter outline (`1..180`) with left/right tap-to-scroll, horizontal swipe/button chapter navigation, and direct transition to Level 3.
  - **Level 3**: Single-frame `.reading-surface` toggle between **Focused Current Chapter** and **All Chapters Skeleton** (with left/right tap-to-scroll and horizontal swipe in Focused mode), plus one-click jump to **Level 4 Pure Visual Art** for that chapter's illustration cluster.
  - **Level 4 Pure Canvas**: Single-frame `.reading-surface` displaying one cluster illustration at a time (`1..28`, or filtered by book), navigable via Prev/Next buttons, tap left/right canvas zones, keyboard `←`/`→`, stepper controls, and touch swipe—completely free of text overlays. Loads repo PNG only when `imageGenerated === true`, otherwise immediately renders wordless SVG art (`ProceduralIllustrator`).
- **Compact Bottom-Right Voice Recording & Playback Dock**: Anchored at `fixed bottom-4 right-4 z-40` as a minimized floating microphone button while reading (displaying an active pulsing timer badge only if currently recording, or take count badge if recordings exist) so it never obstructs story text. Clicking the corner button expands the compact recorder & playback card (record/stop button, live `MM:SS` timer, inline `<audio controls>` playback, persistent session-takes drawer toggle, and a minimize button to collapse back to the corner).
