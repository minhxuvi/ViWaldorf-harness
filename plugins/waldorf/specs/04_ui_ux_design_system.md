# 04 — UI/UX Design System: The Warm Paper Palette

> Governed by [DAO.md](../../../DAO.md).

## 1. Color Palette

The interface reproduces the warmth, texture, and organic serenity of hand-crafted paper, botanical ink, and deep forest foliage:

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FDF8EE` | Primary warm paper page background |
| `--paper2` | `#F7ECD8` | Deepened parchment for headers and table rows |
| `--card` | `#FFFDF7` | Elevated card surface |
| `--ink` | `#2B3A2E` | Deep charcoal-green ink for readable text |
| `--muted` | `#6B7A6E` | Softened ink for secondary notes and metadata |
| `--forest` | `#2F5D3A` | Living forest green for primary actions and accents |
| `--forest2` | `#1E4028` | Deep night forest for the navigation sidebar |
| `--terra` | `#C45C4A` | Warm terracotta earth for highlights, alerts, and badges |
| `--line` | `#E7DCC4` | Soft tactile border line |
| `--leaf-soft` | `#E3EFE0` | Gentle green fill for instructional badges |
| `--sand-soft` | `#FDF0E6` | Warm sand fill for living rhythm badges |

## 2. Typography & Form

- **Headings**: Georgia, serif — evoking classic printed storybooks.
- **Body**: Clean system sans-serif — high legibility across desktop and mobile.
- **Cards**: Rounded 14px–16px corners with subtle warm shadows (`rgba(60, 50, 20, 0.05)`).
- **Navigation**: Persistent left sidebar (250px) on desktop; fluid top-bar drawer on mobile screens.

## 3. Story Retelling Studio, Storybook Reader & Accessible Voice Bar

- **Dual Experience Mode Switcher**: Seamlessly toggles between **Retelling Studio** (`studio`) for active oral rehearsal and **Storybook Reader** (`reader`) for quiet, immersive whole-story contemplation.
- **Single-Scene Theater Stage**: Displays exactly one scene artwork at a time to prevent cognitive overload. Navigable via Prev/Next buttons, keyboard arrow keys (`←`/`→`), progress stepper dots, and touch-swipe gestures.
- **Illustrated Storybook Reader**: Provides authentic picture-book presentation (large Goethean artwork + illuminated story text with drop cap and page turner) and continuous prose reading with embedded illustrations and oral audio playback.
- **Full Story Reference Slide-over Drawer**: Instantly accessible from the Studio without losing active recording state, gently highlighting the current scene within the complete narrative arc.
- **Focused Oral Workspace**: Replaces redundant prompt boxes with a cohesive dictation, dialect learning, and acoustic analysis report center.
- **Persistent Floating Voice Bar**: Docked at `bottom-4` / `bottom-6` with backdrop blur, terracotta/forest buttons, live recording timer, scene index stepper (`< Scene X / Y >`), audio playback, and quick full-story trigger—guaranteeing zero loss of recording controls during page scrolling without overlapping content (`pb-28`).
