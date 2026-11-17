# 02 — Modules and Plugins

> Governed by [DAO.md](../../DAO.md).

## 1. The Plugin Contract

Domains of pedagogical value are encapsulated in `plugins/<name>/`, while the Next.js runtime mounts the UI and local browser storage.

## 2. Plugin Structure

```text
plugins/<name>/
├── specs/
│   ├── 00_master_prompt.md
│   ├── 01_waldorf_pedagogy_and_art.md
│   └── 04_ui_ux_design_system.md
└── researcher/specs/
    └── 01-waldorf-researcher.md
```

## 3. The `waldorf` Plugin

The `waldorf` plugin focuses exclusively on **Storytelling Practice (Luyện kể chuyện)**:
- **5 Progressive Practice Levels (Level 0–4)** for internalizing stories organically.
- **3 Pure-Visual Waldorf Art Styles** (Wet-on-Wet watercolor, Beeswax crayon, Chalkboard pastel) with zero text overlays.
- **In-Browser Voice Recording & Playback** without AI scoring or evaluation.
