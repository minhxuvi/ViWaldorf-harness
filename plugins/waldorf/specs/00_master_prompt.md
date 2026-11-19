# 00. Master Prompt: ViWaldorf Pure Storytelling Practice

## 1. Intent & Outcome
- **ViWaldorf Storytelling** is a focused, zero-AI pedagogical practice tool designed exclusively to help parents and educators internalize and tell the epic *Từ Sáng Thế Đến Giáng Sinh* aloud.
- **Single-Story Multilingual Source by Folder Path**: Serves exclusively `https://github.com/xuvivn/from-genesis-to-nativity` (`languages.json`, `locales/{vi,en,zh}/story-index.json`, `locales/{lang}/level-0-context/` .. `level-4-visual-prompts/`, and shared `assets/images/`), encompassing **5 Books · 180 Chapters · 28 Cluster Illustrations** in a unified edition (target age 9–10, Jakob Streit style). Supports local pre-push reads via `/api/local-repo` on localhost.
- **Optional Context & Story Soul Reading Drawer (`locales/{lang}/level-0-context/`)**:
  - Surfaced as a dedicated **Read More: Background & Story Soul** panel containing the epic overview (`00-epic-soul-overview.md`), book-level cultural spirit, storytelling rhythm, metaphors, ancient name pronunciations, and the 25 ancient reference texts (`ancient-texts/`).
- **Four Progressive Practice Levels (Level 1 – Level 4)**:
  1. **Level 1 — Toàn văn câu chuyện**: Complete read-aloud narrative across all **180 Chapters** paired with explicit *Lưu ý giọng kể* / *Storytelling Notes* / *讲演提示* per chapter. **Export Full Story PDF** (**With Images** or **Without Images**) lives once inside the expandable **Hướng dẫn & Tiện ích** (**Guide & Tools**) drawer.
  2. **Level 2 — Dàn ý chi tiết**: Practice retelling without the full text while retaining characters/motifs, detailed beats, and storytelling takeaways per chapter.
  3. **Level 3 — Dàn ý tóm tắt**: One unified skeleton outline closely following the original plot (`locales/{lang}/level-3-summary-outline/chapter-summaries.md`) across all 180 chapters.
  4. **Level 4 — Tranh gợi nhớ thuần hình ảnh**: Displays all **28 cluster illustrations** directly from `assets/images/` (`image_generated === true` for all 28 scenes) with seamless fallback to local hand-drawn SVG styles (`wet-on-wet`, `crayon`, `chalkboard`) containing **zero text hints**.
- **Automatic Reading Progress Restoration & Member Account Sync**:
  - Automatically remembers the active book, practice level, chapter/illustration, reading view settings, and scroll position in browser `localStorage` so reopening the site in the same browser resumes at the exact reading spot.
  - Optional member authentication (Email/Password and Google SSO) persists and merges reading progress across sessions via `/api/progress` and establishes a clean account foundation for future features.
- **Human-Centered Community Feedback (Zero AI)**:
  - Public feedback space allowing visitors to read feedback and development progress, and signed-in members to post new feedback threads, reply, and close their own threads.
  - Strictly free of any AI references, AI badges, or AI wording—designed to feel welcoming and respectful to Waldorf parents and educators.
- **Pure Voice Recording & Playback**:
  - Direct in-browser voice recording (`MediaRecorder`) with seamless Pause & Resume within a single take when interrupted mid-story, active duration tracking, and immediate playback (`<audio controls>`) so the storyteller can listen back to their own voice naturally.

## 2. Hard Constraints & Non-Goals
- **Single-Story Focused UI**: No story switcher, age-group selector, file upload, custom story form, or library reset controls.
- **Minimal Opening & Expandable Guidance**: Open directly into Level 1 practice with a single compact Practice Level dropdown (Level 1–4) styled alongside the **Context & Ancient Texts** and **Guide & Tools** expandable entry points. Keep PDF, sync, source, Level 1 display mode, and Level 4 art-customization tools inside the expandable utility panel rather than the reading surface.
- **Zero AI Features & Zero AI Language**: No remote AI APIs, no AI chat, no automated story scoring, no acoustic/transcript grading, and **no mention of AI** in the feedback system or user-facing copy.
- **Privacy First**: Audio recordings remain strictly in-memory / on the user's device; zero network transmission of recordings.
