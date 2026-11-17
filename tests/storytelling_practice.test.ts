import test from "node:test";
import assert from "node:assert/strict";
import { getSeedData, segmentStoryLocally } from "../lib/seedData";
import { ProceduralIllustrator } from "../lib/art/proceduralIllustrator";
import {
  GENESIS_REPO_URL,
  GENESIS_STORY_ID,
  parseLevel0BookMarkdown,
  parseLevel1Markdown,
  parseLevel2Markdown,
  parseLevel3Markdown,
} from "../lib/repoStoryLoader";
import { WaldorfArtStyle } from "../lib/types";

test("Default seed removes legacy sample stories and mounts xuvivn/from-genesis-to-nativity as first story", () => {
  const seed = getSeedData();
  assert.equal(seed.stories.length, 1, "Default library should contain only the repo story");

  const story = seed.stories[0];
  assert.equal(story.id, GENESIS_STORY_ID);
  assert.equal(story.repoUrl, GENESIS_REPO_URL);
  assert.ok(!seed.stories.some((s) => s.id === "story-hoian-money"));
  assert.ok(!seed.stories.some((s) => s.id === "story-abraham-stars"));
  assert.ok(!seed.stories.some((s) => s.id === "story-cloud-seed"));

  assert.equal(story.books?.length, 5, "Expected 5 books in epic");
  assert.equal(story.scenes.length, 28, "Expected 28 scenes in epic");
  assert.equal(story.soul.ancientBooks?.length, 25, "Expected 25 ancient reference books");
});

test("Level 0–3: All 28 seed scenes contain complete 5-level structures and exact repo folder paths", () => {
  const seed = getSeedData();
  const story = seed.stories[0];

  // Level 0: Soul per book
  for (const bk of story.books || []) {
    const bookSoul = story.soul.bookSouls?.[bk.id];
    assert.ok(bookSoul, `Missing bookSoul for ${bk.id}`);
    assert.ok(bookSoul.culturalSpirit.trim().length > 20, `${bk.id}: missing culturalSpirit`);
    assert.ok(bookSoul.storytellingRhythm.trim().length > 20, `${bk.id}: missing storytellingRhythm`);
    assert.ok(bookSoul.ageMetaphor.trim().length > 20, `${bk.id}: missing ageMetaphor`);
    assert.ok(bookSoul.pronunciations.length >= 3, `${bk.id}: must have pronunciation guides`);
  }

  for (const sc of story.scenes) {
    assert.ok(sc.passage.trim().length > 40, `${sc.id}: missing read-aloud passage`);
    assert.ok(sc.voiceNote.trim().length > 20, `${sc.id}: missing voiceNote`);
    assert.ok(sc.detailedOutline.characters.length >= 1, `${sc.id}: missing characters`);
    assert.ok(sc.detailedOutline.localizedDetails.length >= 2, `${sc.id}: missing localizedDetails`);
    assert.ok(sc.detailedOutline.emotionalRhythm.trim().length > 10, `${sc.id}: missing emotionalRhythm`);
    assert.ok(sc.detailedOutline.beats.length >= 3, `${sc.id}: missing detailed beats`);
    assert.ok(
      sc.summaryPoints.length >= 4 && sc.summaryPoints.length <= 6,
      `${sc.id}: expected 4–6 summaryPoints, got ${sc.summaryPoints.length}`
    );

    assert.ok(sc.levelPaths, `${sc.id}: missing levelPaths`);
    assert.ok(sc.levelPaths.level0Book.startsWith("level-0-khong-gian-boi-canh/"));
    assert.ok(sc.levelPaths.level1["6-10"].startsWith("level-1-toan-van/6-10-tuoi-chuan/"));
    assert.ok(sc.levelPaths.level1["3-5"].startsWith("level-1-toan-van/3-5-tuoi-mam-non/"));
    assert.ok(
      sc.levelPaths.level1["11+"].startsWith("level-1-toan-van/11-cong-thieu-nien-nguoi-lon/")
    );
    assert.ok(sc.levelPaths.level3 === "level-3-dan-y-tom-tat/dan-y-tom-tat-28-phan-canh.md");
    assert.ok(sc.repoImage?.startsWith("level-4-tranh-goi-nho/images/"));
  }
});

test("Repo Markdown parsers parse Level 0, Level 1, Level 2 (3-5/6-10/11+), and Level 3 cleanly", () => {
  const sampleL0 = `# Level 0 — Quyển V
## 1. Vì Sao Phần Này Đặt Làm Ngoại Truyện?
Phần ngoại truyện nối ánh sáng Giáng sinh sang thế kỷ IV tại thành cảng Myra.
## 2. Nhịp Điệu Kể Chuyện Đặc Trưng
- Giọng mở nối dịu dàng bên bếp lửa.
## 3. Thông Điệp Ẩn Dụ Theo Lứa Tuổi
### Lứa tuổi 3–5 (Mầm non)
Chiếc tất nhỏ nhắc bé biết chia sẻ niềm vui.
### Lứa tuổi 6–10 (Tiểu học)
Sự tử tế đích thực giữ phẩm giá cho người nhận.
### Lứa tuổi 11+ (Thiếu niên & Người lớn)
Hạt giống tình thương đi qua mười bảy thế kỷ.
## 4. Hướng Dẫn Phát Âm Tên Riêng & Địa Danh Cổ (Quyển V)
| Tên trong văn bản | Cách đọc tự nhiên khi kể (Tiếng Việt) | Ngữ cảnh xuất hiện |
| :--- | :--- | :--- |
| **Nicholas** | *Ni-cô-la* | Giám mục thành Myra (Cảnh 28) |
`;
  const parsedL0 = parseLevel0BookMarkdown(sampleL0);
  assert.ok(parsedL0.culturalSpirit.includes("Myra"));
  assert.ok(parsedL0.ageMetaphors?.["3-5"]?.includes("Chiếc tất nhỏ"));
  assert.ok(parsedL0.ageMetaphors?.["6-10"]?.includes("Sự tử tế"));
  assert.ok(parsedL0.ageMetaphors?.["11+"]?.includes("mười bảy thế kỷ"));
  assert.equal(parsedL0.pronunciations.length, 1);
  assert.equal(parsedL0.pronunciations[0].term, "Nicholas");
  assert.equal(parsedL0.pronunciations[0].pronunciation, "Ni-cô-la");

  const sampleL1 = `# Quyển I
## Phân cảnh 01 (\`canh-01-khoi-nguyen-va-cuoc-chien-anh-sang\`): Khởi Nguyên Thế Giới
Ngày xửa ngày xưa, bầu trời rực ánh sáng ban đầu.

Michael vung gươm ánh sáng bảo vệ thiên đàng.

### Lưu ý giọng kể & Điểm nhấn chiều sâu
- Giọng mở đầu chậm rãi, trang trọng.
---
`;
  const parsedL1 = parseLevel1Markdown(sampleL1);
  const s1 = parsedL1["canh-01-khoi-nguyen-va-cuoc-chien-anh-sang"];
  assert.ok(s1);
  assert.ok(s1.passage.includes("Ngày xửa ngày xưa"));
  assert.ok(s1.voiceNote.includes("Giọng mở đầu chậm rãi"));

  const sampleL2 = `# Level 2
## Phân cảnh 01 (\`canh-01-khoi-nguyen-va-cuoc-chien-anh-sang\`): Khởi Nguyên
- **Nhân vật & Hình tượng trung tâm:** Đấng Tạo Hóa, *Michael*, *Lucifer* (đám mây xám), Con Rồng.
- **Diễn biến chi tiết:**
  - **Thế giới thiên đàng:** Khắp nơi vang tiếng sáo trúc.
  - **Cuộc chiến ánh sáng:** Michael đẩy lùi bóng tối.
- **Ý nghĩa / Điểm nhấn kể chuyện:** Mở đầu sử thi bằng chiến thắng của ánh sáng.
`;
  const parsedL2 = parseLevel2Markdown(sampleL2);
  const o1 = parsedL2["canh-01-khoi-nguyen-va-cuoc-chien-anh-sang"];
  assert.ok(o1);
  assert.equal(o1.characters.length, 4);
  assert.equal(o1.beats.length, 2);
  assert.ok(o1.emotionalRhythm.includes("chiến thắng của ánh sáng"));

  const sampleL3 = `# Level 3
### Phân cảnh 28 (\`canh-28-ngoai-truyen-thanh-nicholas-va-ong-gia-noel\`): Ngoại Truyện
- Ý thứ nhất tại thành cảng Patara.
- Ý thứ hai thả ba túi vàng qua cửa sổ.
- Ý thứ ba cứu đói thành Myra.
- Ý thứ tư hóa thành Ông già Noel.
`;
  const parsedL3 = parseLevel3Markdown(sampleL3);
  assert.equal(parsedL3["canh-28-ngoai-truyen-thanh-nicholas-va-ong-gia-noel"].length, 4);
});

test("Level 4: ProceduralIllustrator renders pure visual SVGs with zero <text> hints across all 28 scenes and 3 styles", () => {
  const seed = getSeedData();
  const styles: WaldorfArtStyle[] = ["wet-on-wet", "crayon", "chalkboard"];

  for (const scene of seed.stories[0].scenes) {
    for (const style of styles) {
      const dataUrl = ProceduralIllustrator.generateArtSVG(scene, style);
      assert.ok(
        dataUrl.startsWith("data:image/svg+xml;utf8,"),
        `Expected SVG data URL for ${scene.id} (${style})`
      );

      const decodedSvg = decodeURIComponent(dataUrl.replace("data:image/svg+xml;utf8,", ""));
      assert.ok(decodedSvg.includes("<svg"), "SVG must contain opening <svg tag");
      assert.ok(decodedSvg.includes("</svg>"), "SVG must contain closing </svg> tag");
      assert.ok(
        !/<text[\s>]/i.test(decodedSvg),
        `Level 4 artwork for ${scene.id} (${style}) must NOT contain <text> elements`
      );
    }
  }
});

test("ProceduralIllustrator.escapeXml: safely escapes XML metacharacters", () => {
  const escaped = ProceduralIllustrator.escapeXml(`<script>alert("XSS")</script> & 'test'`);
  assert.equal(escaped, "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; &apos;test&apos;");
});

test("segmentStoryLocally: builds complete Level 0–4 structure from raw user story text", () => {
  const rawMultiPara = `Ngày xưa bên dãy núi Trường Sơn có một bản làng nhỏ bình yên quanh năm nghe tiếng suối reo.

Một buổi sáng mùa thu, cậu bé Páo theo cha lên rừng tìm những cây tre thẳng đẹp để đan gùi.

Khi cơn mưa rừng bất ngờ ập xuống, hai cha con trú dưới gốc cây cổ thụ và chia nhau nắm cơm nếp thơm.

Chiều tà nắng hửng lên, Páo mang những ống tre vàng óng về tặng bà làm sáo trúc ngân vang khắp bản.`;

  const story = segmentStoryLocally({
    title: "Tiếng sáo trúc bản nhỏ",
    ageRange: "7–9 tuổi",
    artStyle: "crayon",
    rawText: rawMultiPara,
  });

  assert.equal(story.title, "Tiếng sáo trúc bản nhỏ");
  assert.equal(story.defaultArtStyle, "crayon");
  assert.equal(story.scenes.length, 4);
  assert.ok(story.soul.culturalSpirit.length > 0);
  assert.ok(story.soul.pronunciations.length >= 1);

  for (const sc of story.scenes) {
    assert.ok(sc.passage.length > 0);
    assert.ok(sc.voiceNote.length > 0);
    assert.ok(sc.detailedOutline.beats.length >= 1);
    assert.ok(
      sc.summaryPoints.length >= 4 && sc.summaryPoints.length <= 6,
      `Expected 4–6 summary points, got ${sc.summaryPoints.length}`
    );
  }
});
