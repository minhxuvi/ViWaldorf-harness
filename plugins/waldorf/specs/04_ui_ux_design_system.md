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
- **Cards**: Rounded 14px–16px corners with subtle warm shadows (`rgba(60, 50, 20, 0.05)`).
- **Navigation**: Minimal top header bar (brand title, language toggle VI/EN, seed reset) leading straight into the single-page Storytelling Practice Studio.

## 3. Single-Page Storytelling Studio & Voice Playback Dock

- **Story, Book & Age Segmented Controls**: Book filter pills (`All` + `Book I–V`), tactile segmented pills for Age Variants (`3–5`, `6–10`, `11+`), compact offline-ready sync status, and subtle GitHub folder-path chip.
- **5-Level Tactile Switcher**: Responsive step tabs (`Level 0` → `Level 4`, 2+2+1 balanced mobile layout → 5-column desktop) with bottom Previous/Next level progression bars.
- **Level-Specific Ergonomics**:
  - **Level 0**: Collapsible epic overview (`00-tong-quan-linh-hon-su-thi.md`), book-level Soul cards, pronunciation guide, and categorized Ancient Reference Library (`Tất cả`, `Kinh Cựu Ước`, `Kinh Tân Ước`, `Cổ Thư & Sử Truyền`) with cleaned Markdown reading view.
  - **Level 1**: Vocal delivery note positioned before the passage to establish breath before reading, selectable reading text size (`S` / `M` / `L`), and top+bottom scene navigation.
  - **Level 2**: Structured scene outline with bottom scene navigation and direct transition to Level 3.
  - **Level 3**: Toggle between **Focused Current Scene** and **All Scenes Skeleton**, with one-click jump to **Level 4 Pure Visual Art** for that scene.
  - **Level 4 Pure Canvas**: Displays a single scene artwork at a time (16:10 standard or expanded **Stage Mode**) navigable via Prev/Next buttons, keyboard `←`/`→`, stepper dots, and touch swipe—completely free of text overlays. Loads repo PNG only when `imageGenerated === true`, otherwise immediately renders wordless 12+ motif SVG art (`ProceduralIllustrator`).
- **Persistent Voice Recording & Playback Dock**: Fixed at `bottom-4` with backdrop blur, record/stop button, live timer (`MM:SS`), inline `<audio controls>` playback, persistent session-takes drawer toggle (highlighting takes matching the active scene), and `pb-32` page spacing to prevent overlap.
