# 02 — Modules and Plugins

> Governed by [DAO.md](../../DAO.md).

## 1. The Plugin Contract

In ViWaldorf Harness, domains of real-world value are isolated into self-contained plugins. The core harness is domain-agnostic and provides:
1. Sandboxed filesystem and data storage access.
2. Model gateway connectivity (Meta AI / Muse / Local).
3. Session logging and audit tracking.
4. UI component mounting.

## 2. Plugin Structure

Each plugin follows the standard layout:
```text
plugins/<name>/
├── specs/
│   ├── 00_master_prompt.md
│   ├── 01_domain_pedagogy.md
│   └── ...
├── researcher/specs/
│   └── 01_domain_research.md
├── references/
└── assets/
```

## 3. The `waldorf` Plugin

The premier plugin for ViWaldorf is `waldorf`, focusing on Waldorf-inspired education in Vietnam. It encapsulates:
- Story Retelling Practice (`XuVi Story`).
- 3 Waldorf Art Techniques (Wet-on-Wet watercolor, Beeswax crayon, Chalkboard pastel).
- Acoustic speech analysis (WAV 24kHz).
- Dialect adaptation engine for Vietnamese regional accents.
- Generation of the 6 mandatory educational documents.
