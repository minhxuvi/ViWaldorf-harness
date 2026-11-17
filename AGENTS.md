# Working Rules for All Agents in `ViWaldorf-harness`

- **NEVER SELF-EDIT `DAO.md`.**
- **Difficult choices do not require asking the user; decide autonomously based on the ethos in `DAO.md`.**
- **Local Review Policy**: Do not automatically commit, push, or deploy. Keep all changes local for user review.

---

## 1. Reading Order (Just-In-Time Retrieval)

1. `DAO.md` — The supreme decision compass. Never modified.
2. `README.md` — Map of the Storytelling Practice application: DAO → specs → web studio → benchmarker.
3. `cron.md` — Evolution loop, three gates (DAO / Benchmarker / Whitelist Commit), stopping conditions.
4. `benchmarker/specs/01-overall-benchmark.md` and the latest entry in `benchmarker/results/INDEX.md`.
5. Domain-specific specs:
   - Harness & Web Architecture: `harness/specs/**` and `researcher/specs/**`.
   - Waldorf Storytelling Domain: `plugins/waldorf/specs/**` and `plugins/waldorf/researcher/specs/**`.

---

## 2. Minimalist Working Principles

- **Single-Purpose Storytelling Focus**: Keep the application focused strictly on 5-level storytelling practice (Levels 0–4) and local record/playback only. Zero AI features, zero extraneous modules.
- **Prioritize minimizing requirements over adding new ones.**
- **Prioritize refactoring existing code over writing new code.**
- **Prioritize deleting redundant text over adding text.**
- **Zero-Warning TypeScript**: Build clean with strict types and zero errors.
- **Strict Separation of Researchers**:
  - Root `researcher/` serves exclusively web runtime/media architecture research.
  - Each plugin maintains its own domain researcher in `plugins/<name>/researcher/specs/`.

---

## 3. Autonomous Decisions under DAO (4 Steps)

1. **Life First**: Protect and nurture the vitality of children, families, educators, and community.
2. **Truthfulness**: Declare evidence levels honestly (`live` / `automated` / `manual` / `mock` / `unverified`). Local algorithms and procedural SVG drawings must be labeled as local. Never claim official state (GDPT) or Waldorf certification without proof.
3. **Privacy**: Minimal data collection, 100% local-first in browser, zero network leakage of voice recordings or data.
4. **Learnability**: Fully traceable to specs, measurable by benchmarker, refactorable with better evidence.

If tied or uncertain after all 4 steps: choose the simpler, more minimalist option, delete redundant code, and park (`PARK`) unverified items.

---

## 4. Evolution Rules & Hard Boundaries

- **Specs First, Benchmarker as Gate**: Edit specs → refactor/generate code → measure via benchmarker → record in `benchmarker/results/` and update `benchmarker/results/INDEX.md`.
- **Commit Whitelist**:
  - Only commit `*/specs/**`, `plugins/**/researcher/specs/**`, `benchmarker/results/**`, web source code, tests, and root governance files (`DAO.md`, `AGENTS.md`, `cron.md`, `README.md`, `package.json`, `tsconfig.json`, `.gitignore`, `LICENSE`).
- **Hard Boundaries**:
  - Never edit `DAO.md`.
  - Never read, quote, or commit: `.env`, secret API keys, or real student personal data.
  - Never modify past benchmark historical entries.
  - Never claim official state (GDPT) or Waldorf certifications.
