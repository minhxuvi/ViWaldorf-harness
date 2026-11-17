# 00. Master Prompt: ViWaldorf Pure Storytelling Practice

## 1. Intent & Outcome
- **ViWaldorf Storytelling** is a focused, zero-AI pedagogical practice tool designed exclusively to help parents and educators internalize and tell the epic *Từ Sáng Thế Đến Giáng Sinh* aloud.
- **Single-Story Source by Folder Path**: Serves exclusively `https://github.com/xuvivn/from-genesis-to-nativity` (`story-index.json` and `level-0-*` .. `level-4-*` folders), encompassing **5 Books · 180 Chapters · 28 Cluster Illustrations** in a unified edition (target age 9–10, Jakob Streit style).
- **Optional Context & Story Soul Reading Drawer (`level-0-khong-gian-boi-canh/`)**:
  - Removed as a storytelling practice level and surfaced instead as a dedicated **Read More: Background & Story Soul** panel containing the epic overview (`00-tong-quan-linh-hon-su-thi.md`), book-level cultural spirit, storytelling rhythm, metaphors, ancient name pronunciations, and the 25 ancient reference texts (`van-ban-co/`).
- **Four Progressive Practice Levels (Level 1 – Level 4)**:
  1. **Level 1 — Toàn văn câu chuyện**: Complete read-aloud narrative across all **180 Chapters** paired with explicit *Lưu ý giọng kể* (vocal delivery notes) per chapter, plus **Export Full Story PDF (with Level 4 illustrations)**.
  2. **Level 2 — Dàn ý chi tiết**: Practice retelling without the full text while retaining characters/motifs, detailed beats, and storytelling takeaways per chapter.
  3. **Level 3 — Dàn ý tóm tắt**: One unified skeleton outline closely following the original plot (`level-3-dan-y-tom-tat/dan-y-tom-tat-cac-chuong.md`) across all 180 chapters.
  4. **Level 4 — Tranh gợi nhớ thuần hình ảnh**: Displays the **28 cluster illustrations** directly from `level-4-tranh-goi-nho/images/` (`image_generated === true`) with seamless fallback to local hand-drawn SVG styles (`wet-on-wet`, `crayon`, `chalkboard`) containing **zero text hints**.
- **Pure Voice Recording & Playback**:
  - Direct in-browser voice recording (`MediaRecorder`) and playback (`<audio controls>`) so the storyteller can listen back to their own voice naturally.

## 2. Hard Constraints & Non-Goals
- **Single-Story Focused UI**: Temporarily removes the story selector, age-group selector, file upload, custom story form, and library reset controls so the entire interface serves *Từ Sáng Thế Đến Giáng Sinh* cleanly.
- **Zero AI Features**: No remote AI APIs, no AI chat, no automated story scoring, no acoustic/transcript grading, and no speech-to-text evaluation.
- **Single-Focus Scope**: No weekly timetables, classroom curriculum documents, student rosters, or cloud sync of user audio/data.
- **Privacy First**: Audio recordings remain strictly in-memory / on the user's device; zero network transmission of recordings or personal data.
