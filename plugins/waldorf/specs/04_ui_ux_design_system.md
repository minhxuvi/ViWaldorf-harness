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
- **Navigation**: Minimal top header bar (brand title, Community Feedback toggle, Sign-In / Member account chip with Google SSO support, and `VI · EN · 中文` language selector) that auto-hides smoothly (`-translate-y-full`) when scrolling down past 64px to read and reappears (`translate-y-0`) when scrolling up or near the top of the page.

## 3. Single-Story Storytelling Studio, Progress Continuity, Auth & Community Feedback

- **Single Opening Practice Surface**: Remove the legacy epic title banner, long introduction, fixed level-description card, and always-visible filters from the opening viewport. The top row contains a single compact Practice Level dropdown (`1. Toàn văn` → `4. Tranh thuần hình ảnh`) styled uniformly alongside the two expandable entry points: **Bối cảnh & Cổ thư** and **Hướng dẫn & Tiện ích**.
- **Expandable Utility Drawer**: **Hướng dẫn & Tiện ích** contains the short epic introduction, four-level practice guide, touch/keyboard/recording tips, PDF export choices, Level 1 view mode, Level 4 artwork customization, offline sync status, repository sync, and GitHub source link. **Bối cảnh & Cổ thư** remains a separate expandable reading drawer.
- **Compact Reading Toolbar**: Within `.reading-surface`, use a compact Book `<select>`, chapter or illustration navigation, Level 1 text size or Level 3 scope controls, and the Level 4 stage toggle (plus an honest local SVG badge only when falling back to procedural SVG art). PDF export, SVG-style selector, local image upload/reset, and repository sync controls live inside **Hướng dẫn & Tiện ích** so the reading and illustration canvas stays serene.
- **Automatic Reading Progress & Scroll Restoration**: Seamlessly persists active book, level, chapter (`1..180`), illustration (`1..28`), reading settings (`level1FlowMode`, `level1TextSize`, `level3Scope`, `showContextSection`), and scroll offset (`scrollY` / `scrollRatio`) to browser `localStorage` and restores the reader to that exact chapter and scroll position upon reopening. When signed in, progress merges with `/api/progress` by latest timestamp.
- **Member Sign-In & Google SSO Modal (`AuthModal.tsx`)**: Warm paper modal supporting Email/Password sign-in, registration, and 1-click **Sign in with Google** (with standard 4-color Google mark) when OAuth is configured.
- **Zero-AI Community Feedback (`FeedbackSection.tsx`)**: Accessible from the top navigation bar without losing the reader's story position. Displays public feedback threads, status filters (`Tất cả`, `Mở`, `Đang triển khai`, `Đã phản hồi`, `Đã đóng`), thread creation with optional current-chapter context tag, thread details with development progress tracking, human **Ban biên tập** badges for official editorial replies, member replies, and author self-close—with zero mentions of AI.
- **Background & Story Soul Reading Drawer (`level-0-context`)**: Dedicated expandable reading section with collapsible epic overview (`00-epic-soul-overview.md`), book-level Soul cards, pronunciation guide, and categorized Ancient Reference Library (`ancient-texts/`).
- **4-Level Tactile Switcher**: A compact dropdown button (`LevelSelectDropdown`, defaulting to **Level 1**) styled like the adjacent expandable panel buttons opens practice directly in **Level 1**, paired with bottom Previous/Next level progression bars. Fixed level description banners and inline tap/swipe hint lines no longer clutter the reading surface.
- **Compact Bottom-Right Voice Recording & Playback Dock**: Anchored at `fixed bottom-4 right-4 z-40` as a minimized floating microphone button while reading so it never obstructs story text.
