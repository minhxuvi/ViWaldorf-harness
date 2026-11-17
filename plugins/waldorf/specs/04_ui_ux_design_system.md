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

- **Headings**: Georgia, serif — evoking classic printed storybooks.
- **Body**: Clean system sans-serif — high legibility across desktop and mobile.
- **Cards**: Rounded 14px–16px corners with subtle warm shadows (`rgba(60, 50, 20, 0.05)`).
- **Navigation**: Minimal top header bar (brand title, language toggle VI/EN, seed reset) leading straight into the single-page Storytelling Practice Studio.

## 3. Single-Page Storytelling Studio & Voice Playback Dock

- **5-Level Tactile Switcher**: Horizontal step tabs (`Level 0` → `Level 4`) allowing fluid progression or direct jumps between Context & Soul, Full Read-Aloud Text, Detailed Outline, Unified Summary Skeleton, and Pure Visual Recall.
- **Level 4 Pure Canvas**: Displays a single scene artwork at a time (16:10 stage) navigable via Prev/Next buttons, keyboard `←`/`→`, stepper dots, and touch swipe—completely free of text overlays.
- **Persistent Voice Recording & Playback Dock**: Fixed at `bottom-4` / `bottom-6` with backdrop blur, record/stop button, live timer (`MM:SS`), inline `<audio controls>` playback for listening back, and collapsible session takes list (`pb-28` page spacing to avoid overlap).
