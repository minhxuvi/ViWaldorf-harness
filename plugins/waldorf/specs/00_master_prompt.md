# 00. Master Prompt: ViWaldorf Pure Storytelling Practice

## 1. Intent & Outcome
- **ViWaldorf Storytelling** is a focused, zero-AI pedagogical practice tool designed exclusively to help parents and educators internalize and tell stories aloud.
- **Primary Story Source by Folder Path**: Loads the epic *Từ Sáng Thế Đến Giáng Sinh* (5 books, 28 scenes) directly from `https://github.com/xuvivn/from-genesis-to-nativity` (`story-index.json` and `level-0-*` .. `level-4-*` folders), supporting age variants (`3–5`, `6–10`, `11+`) and continuous upstream updates without code changes.
- **Five Progressive Practice Levels (Level 0 – Level 4)**:
  1. **Level 0 — Không gian bối cảnh & Linh hồn câu chuyện**: Grasp each book's cultural spirit, storytelling rhythm, age-appropriate metaphor, ancient name pronunciations, and optional reference reading from `level-0-khong-gian-boi-canh/van-ban-co/`.
  2. **Level 1 — Toàn văn câu chuyện**: Complete read-aloud narrative rich in imagery paired with explicit *Lưu ý giọng kể* (vocal delivery notes) for each scene and age variant.
  3. **Level 2 — Dàn ý chi tiết**: Practice retelling without the full text while retaining characters, sensory details, emotional rhythm, and detailed beats.
  4. **Level 3 — Dàn ý tóm tắt**: One unified skeleton outline closely following the original plot (`level-3-dan-y-tom-tat/dan-y-tom-tat-28-phan-canh.md`, 4–6 concise points per scene).
  5. **Level 4 — Tranh gợi nhớ thuần hình ảnh**: Displays scene illustrations directly from `level-4-tranh-goi-nho/images/` with seamless fallback to local hand-drawn SVG styles (`wet-on-wet`, `crayon`, `chalkboard`) containing **zero text hints**.
- **Pure Voice Recording & Playback**:
  - Direct in-browser voice recording (`MediaRecorder`) and playback (`<audio controls>`) so the storyteller can listen back to their own voice naturally.

## 2. Hard Constraints & Non-Goals
- **Zero AI Features**: No remote AI APIs, no AI chat, no automated story scoring, no acoustic/transcript grading, and no speech-to-text evaluation.
- **Single-Focus Scope**: No weekly timetables, classroom curriculum documents, student rosters, or cloud sync of user audio/data.
- **Privacy First**: Audio recordings remain strictly in-memory / on the user's device; zero network transmission of recordings or personal data.
