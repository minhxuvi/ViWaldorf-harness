# Working Rules for All Agents in `ViWaldorf-harness`

- **NEVER SELF-EDIT `DAO.md`.**
- **Difficult choices do not require asking the user; decide autonomously based on the ethos in `DAO.md`.**
- **Default Push & Deploy Policy**: Always commit and push directly to `origin/main` upon completing and verifying code changes with a clean build. The user tests directly on the live website (Vercel). Do not pause or ask for confirmation before pushing/deploying unless there is a destructive action or special high-risk scenario that genuinely requires user attention before deployment.

---

## 1. Reading Order (Just-In-Time Retrieval)

1. `DAO.md` — The supreme decision compass. Never modified.
2. `README.md` — Map of the entire ecosystem: DAO → specs → web harness/plugins → benchmarker → loop.
3. `cron.md` — 7-step evolution cycle, three gates (DAO / Benchmarker / Whitelist Commit), stopping conditions.
4. `benchmarker/specs/01-overall-benchmark.md` and the latest entry in `benchmarker/results/INDEX.md`.
5. Domain-specific specs:
   - Harness & Web Architecture: `harness/specs/**` and `researcher/specs/**`.
   - Waldorf Domain: `plugins/waldorf/specs/**` and `plugins/waldorf/researcher/specs/**`.

---

## 2. Minimalist Working Principles

- **Prioritize minimizing requirements over adding new ones.**
- **Prioritize refactoring existing code over writing new code.**
- **Prioritize deleting redundant text over adding text.**
- **Zero-Warning TypeScript/ESLint**: Build clean with strict types and zero errors.
- **Strict Separation of Researchers**:
  - Root `researcher/` serves exclusively harness and web architecture research.
  - Each plugin maintains its own domain researcher in `plugins/<name>/researcher/specs/`.

---

## 3. Multi-Model Role Distribution

| Role | Primary Models | Core Responsibility |
|---|---|---|
| **`orchestrator`** | `Gemini` (Meta coordination) & `muse-wonder-1.0` (CLI/runtime) | Maintains DAO compass, decomposes tasks, orchestrates the 7-step loop, and integrates results. |
| **`architect`** | `Gemini` + `muse-wonder-1.0` | Reviews web & sync architecture, eliminates duplicate modules, cuts complexity and bloat. |
| **`researcher`** | `Gemini research` + `muse-wonder-1.0` | Investigates harness runtime, Web Audio API, PWA, and sync optimizations in `researcher/specs/**`. |
| **`plugin-researcher`** | `muse-wonder-1.0` + `Gemini` | Researches Waldorf pedagogical arts (wet-on-wet, crayon, chalkboard), Vietnamese regional folklore, and curriculum alignment. |
| **`builder`** | Contributor models + Next.js developers | Implements and refactors web components (`app/**`, `components/**`, `lib/**`) and writes clean markdown specs. |
| **`benchmarker`** | `EvolutionGateJudge` + automated test runner | Evaluates G1–G3 veto gates and B1–B8 dimensions independently, records results in `benchmarker/results/`. |
| **`capabilities`** | `muse-image-1.0`, `muse-voice-transcribe-1.0`, procedural canvas | Generates Waldorf imagery, transcribes audio with timestamps, and analyzes acoustic delivery. |

---

## 4. Autonomous Decisions under DAO (4 Steps)

1. **Life First**: Protect and nurture the vitality of children, families, educators, and community.
2. **Truthfulness**: Declare evidence levels honestly (`live` / `automated` / `manual` / `mock` / `unverified`). Local algorithms must be labeled as local. Never claim official state (GDPT) or Waldorf certification without proof.
3. **Privacy**: Minimal data collection, local-first by default, zero leakage of child data.
4. **Learnability**: Fully traceable to specs, measurable by benchmarker, refactorable with better evidence.

If tied or uncertain after all 4 steps: choose the simpler, more minimalist option, delete redundant code, and park (`PARK`) unverified items.

---

## 5. Evolution Rules & Hard Boundaries

- **Specs First, Benchmarker as Gate**: Edit specs → refactor/generate code → measure via benchmarker → record in `benchmarker/results/` and update `benchmarker/results/INDEX.md`.
- **Commit Whitelist**:
  - Only commit `*/specs/**`, `plugins/**/researcher/specs/**`, `benchmarker/results/**`, web source code, and root governance files (`DAO.md`, `AGENTS.md`, `cron.md`, `README.md`, `package.json`, `tsconfig.json`, `.gitignore`, `LICENSE`).
- **Hard Boundaries**:
  - Never edit `DAO.md`.
  - Never read, quote, or commit: `.env`, secret API keys, or real student personal data.
  - Never modify past benchmark historical entries.
  - Never claim official state (GDPT) or Waldorf certifications.
