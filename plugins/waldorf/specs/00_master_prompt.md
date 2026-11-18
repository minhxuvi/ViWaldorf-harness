# 00. Master Prompt: ViWaldorf Pure Storytelling Practice

## 1. Intent & Outcome
- **ViWaldorf Storytelling** is a focused, zero-AI pedagogical practice tool designed exclusively to help parents and educators internalize and tell the epic *Từ Sáng Thế Đến Giáng Sinh* aloud.
- **Single-Story Source by Folder Path**: Serves exclusively `https://github.com/xuvivn/from-genesis-to-nativity` (`story-index.json` and `level-0-*` .. `level-4-*` folders), encompassing **5 Books · 180 Chapters · 28 Cluster Illustrations** in a unified edition (target age 9–10, Jakob Streit style).
- **Optional Context & Story Soul Reading Drawer (`level-0-khong-gian-boi-canh/`)**:
  - Surfaced as a dedicated **Read More: Background & Story Soul** panel containing the epic overview (`00-tong-quan-linh-hon-su-thi.md`), book-level cultural spirit, storytelling rhythm, metaphors, ancient name pronunciations, and the 25 ancient reference texts (`van-ban-co/`).
- **Four Progressive Practice Levels (Level 1 – Level 4)**:
  1. **Level 1 — Toàn văn câu chuyện**: Complete read-aloud narrative across all **180 Chapters** paired with explicit *Lưu ý giọng kể* (vocal delivery notes) per chapter, plus **Export Full Story PDF** with two options: **With Images (28 Level 4 illustrations)** or **Without Images (Text Only)**.
  2. **Level 2 — Dàn ý chi tiết**: Practice retelling without the full text while retaining characters/motifs, detailed beats, and storytelling takeaways per chapter.
  3. **Level 3 — Dàn ý tóm tắt**: One unified skeleton outline closely following the original plot (`level-3-dan-y-tom-tat/dan-y-tom-tat-cac-chuong.md`) across all 180 chapters.
  4. **Level 4 — Tranh gợi nhớ thuần hình ảnh**: Displays the **28 cluster illustrations** directly from `level-4-tranh-goi-nho/images/` (`image_generated === true`) with seamless fallback to local hand-drawn SVG styles (`wet-on-wet`, `crayon`, `chalkboard`) containing **zero text hints**.
- **Automatic Reading Progress Restoration & Member Account Sync**:
  - Automatically remembers the active book, practice level, chapter/illustration, reading view settings, and scroll position in browser `localStorage` so reopening the site in the same browser resumes at the exact reading spot.
  - Optional member authentication (Email/Password and Google SSO) persists and merges reading progress across sessions via `/api/progress` and establishes a clean account foundation for future features.
- **Human-Centered Community Feedback (Zero AI)**:
  - Public feedback space allowing visitors to read feedback and development progress, and signed-in members to post new feedback threads, reply, and close their own threads.
  - Strictly free of any AI references, AI badges, or AI wording—designed to feel welcoming and respectful to Waldorf parents and educators.
- **Pure Voice Recording & Playback**:
  - Direct in-browser voice recording (`MediaRecorder`) and playback (`<audio controls>`) so the storyteller can listen back to their own voice naturally.

## 2. Hard Constraints & Non-Goals
- **Single-Story Focused UI**: No story switcher, age-group selector, file upload, custom story form, or library reset controls.
- **Zero AI Features & Zero AI Language**: No remote AI APIs, no AI chat, no automated story scoring, no acoustic/transcript grading, and **no mention of AI** in the feedback system or user-facing copy.
- **Privacy First**: Audio recordings remain strictly in-memory / on the user's device; zero network transmission of recordings.
