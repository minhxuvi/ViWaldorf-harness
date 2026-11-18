import test from "node:test";
import assert from "node:assert/strict";
import { getSeedData } from "../lib/seedData";
import { ProceduralIllustrator } from "../lib/art/proceduralIllustrator";
import { buildFullStoryPrintableHtml } from "../lib/pdfExporter";
import {
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_RAW_BASE_URL,
  GENESIS_REPO_URL,
  GENESIS_STORY_ID,
  REPO_SYNC_TTL_MS,
  getCandidateRepoBaseUrls,
  mapWithConcurrency,
  paginatePassage,
  parseLevel0BookMarkdown,
  parseLevel1Markdown,
  parseLevel2Markdown,
  parseLevel3Markdown,
  shouldAutoSyncRepo,
} from "../lib/repoStoryLoader";
import { WaldorfArtStyle } from "../lib/types";

test("Default seed serves exclusively xuvivn/from-genesis-to-nativity (5 Books, 180 Chapters, 28 Illustrations)", () => {
  const seed = getSeedData();
  assert.equal(seed.stories.length, 1, "Library must contain only the single epic story");

  const story = seed.stories[0];
  assert.equal(story.id, GENESIS_STORY_ID);
  assert.equal(story.repoUrl, GENESIS_REPO_URL);
  assert.equal(story.targetAge, "9–10 tuổi");
  assert.equal(story.books?.length, 5, "Expected 5 books in epic");
  assert.equal(story.scenes.length, 180, "Expected 180 chapters in epic");
  assert.equal(story.illustrations.length, 28, "Expected 28 cluster illustrations in epic");
  assert.equal(story.soul.ancientBooks?.length, 25, "Expected 25 ancient reference books");

  const chapterCountByBook = new Map<string, number>();
  for (const sc of story.scenes) {
    chapterCountByBook.set(sc.bookId, (chapterCountByBook.get(sc.bookId) || 0) + 1);
  }
  assert.equal(chapterCountByBook.get("quyen-1"), 67);
  assert.equal(chapterCountByBook.get("quyen-2"), 56);
  assert.equal(chapterCountByBook.get("quyen-3"), 32);
  assert.equal(chapterCountByBook.get("quyen-4"), 15);
  assert.equal(chapterCountByBook.get("quyen-5"), 10);
});

test("Background & Practice levels: All 5 books, 180 chapters, and 28 illustrations have valid repo paths", () => {
  const seed = getSeedData();
  const story = seed.stories[0];

  for (const bk of story.books || []) {
    const bookSoul = story.soul.bookSouls?.[bk.id];
    assert.ok(bookSoul, `Missing bookSoul for ${bk.id}`);
    assert.ok(bookSoul.culturalSpirit.trim().length > 20, `${bk.id}: missing culturalSpirit`);
    assert.ok(bookSoul.storytellingRhythm.trim().length > 20, `${bk.id}: missing storytellingRhythm`);
    assert.ok(bookSoul.ageMetaphor.trim().length > 20, `${bk.id}: missing ageMetaphor`);
    assert.ok(bookSoul.pronunciations.length >= 3, `${bk.id}: must have pronunciation guides`);
    assert.ok(bk.level0File.startsWith("level-0-khong-gian-boi-canh/"));
    assert.ok(bk.level1File.startsWith("level-1-toan-van/"));
    assert.ok(bk.level2File.startsWith("level-2-dan-y-chi-tiet/"));
  }

  for (const sc of story.scenes) {
    assert.ok(sc.passage.trim().length > 20, `${sc.id}: missing passage`);
    assert.ok(sc.voiceNote.trim().length > 20, `${sc.id}: missing voiceNote`);
    assert.ok(sc.detailedOutline.characters.length >= 1, `${sc.id}: missing characters`);
    assert.ok(sc.detailedOutline.emotionalRhythm.trim().length > 10, `${sc.id}: missing emotionalRhythm`);
    assert.ok(sc.detailedOutline.beats.length >= 3, `${sc.id}: missing beats`);
    assert.ok(sc.summaryPoints.length >= 3, `${sc.id}: missing summaryPoints`);
    assert.ok(sc.levelPaths, `${sc.id}: missing levelPaths`);
    assert.ok(sc.levelPaths.level0Book.startsWith("level-0-khong-gian-boi-canh/"));
    assert.ok(sc.levelPaths.level1.startsWith("level-1-toan-van/"));
    assert.ok(sc.levelPaths.level2.startsWith("level-2-dan-y-chi-tiet/"));
    assert.equal(sc.levelPaths.level3, "level-3-dan-y-tom-tat/dan-y-tom-tat-cac-chuong.md");
    assert.ok(sc.repoImage?.startsWith("level-4-tranh-goi-nho/images/"));
  }

  const generatedCount = story.illustrations.filter((il) => il.imageGenerated).length;
  assert.equal(generatedCount, 21, "Expected tranh-01..tranh-21 to have imageGenerated=true");
});

test("Repo Markdown parsers parse updated 180-chapter formats (Level 0, Level 1, Level 2, Level 3)", () => {
  const sampleL0 = `# Level 0 — Quyển V
## 1. Bối Cảnh Văn Hóa & Tinh Thần Cốt Lõi
Phần ngoại truyện nối ánh sáng Giáng sinh sang thế kỷ IV tại thành cảng Myra.
## 2. Nhịp Điệu Kể Chuyện Đặc Trưng (Độ Tuổi 9–10)
- Giọng mở nối dịu dàng bên bếp lửa.
## 3. Điểm Chạm & Ẩn Dụ Cho Trẻ 9–10 Tuổi
- **Điểm chạm:** Niềm vui cho đi âm thầm giữ trọn phẩm giá cho người nhận.
- **Ẩn dụ cốt lõi:** Hạt giống tình thương đi qua mười bảy thế kỷ.
## 4. Hướng Dẫn Phát Âm Tên Riêng & Địa Danh Cổ
| Tên trong văn bản | Cách đọc tự nhiên khi kể (Tiếng Việt) | Ngữ cảnh xuất hiện |
| :--- | :--- | :--- |
| **Nicholas** | *Ni-cô-la* | Giám mục thành Myra (Chương 1–9) |
`;
  const parsedL0 = parseLevel0BookMarkdown(sampleL0);
  assert.ok(parsedL0.culturalSpirit.includes("Myra"));
  assert.ok(parsedL0.storytellingRhythm.includes("bếp lửa"));
  assert.ok(parsedL0.ageMetaphor.includes("mười bảy thế kỷ"));
  assert.equal(parsedL0.pronunciations.length, 1);
  assert.equal(parsedL0.pronunciations[0].term, "Nicholas");
  assert.equal(parsedL0.pronunciations[0].pronunciation, "Ni-cô-la");

  const sampleL1 = `# Quyển I: Khởi Nguyên Và Ánh Sáng Đầu Tiên

## Phần I: Bảy Ngày Sáng Thế

### Chương 1: Khởi Nguyên Của Thế Giới

Ngày xưa thật xưa, khi ấy chưa có mặt đất.

> *"Ánh sáng tỏa rạng khắp tầng không."*

#### Lưu ý giọng kể
- **Nhịp mở màn:** Khoan thai, vang rộng để cảm nhận không gian thiên đàng.

---

### Chương 2: Michael Và Con Rồng

Dưới vực sâu tối tăm lạnh lẽo, các ác linh bàn nhau chế tạo con rồng.

#### Lưu ý giọng kể
- **Tạo kịch tính:** Giọng Michael sáng rõ, dứt khoát.

## Phần II: Con Cháu Của Cain
`;
  const parsedL1 = parseLevel1Markdown(sampleL1);
  assert.ok(parsedL1[1]);
  assert.ok(parsedL1[1].passage.includes("Ngày xưa thật xưa"));
  assert.ok(parsedL1[1].passage.includes("Ánh sáng tỏa rạng"));
  assert.ok(!parsedL1[1].passage.includes("Lưu ý giọng kể"));
  assert.ok(parsedL1[1].voiceNote.includes("Khoan thai"));
  assert.ok(parsedL1[2]);
  assert.ok(!parsedL1[2].voiceNote.includes("Phần II"));

  const sampleL2 = `# Level 2
## Phần I: Bảy Ngày Sáng Thế

### Chương 1: Khởi Nguyên Của Thế Giới
- **Nhân vật & Hình tượng trung tâm:** Đấng Tạo Hóa, *Lucifer*, *Michael*, thanh gươm sấm sét.
- **Diễn biến chi tiết:**
  - Thuở ban đầu chưa có trái đất.
  - *Michael* vung gươm sấm sét đẩy lùi phe *Lucifer*.
- **Ý nghĩa / Điểm nhấn kể chuyện:** Giải thích nguồn gốc ánh sáng và bóng tối bằng hình tượng trực quan.
`;
  const parsedL2 = parseLevel2Markdown(sampleL2);
  assert.ok(parsedL2[1]);
  assert.equal(parsedL2[1].characters.length, 4);
  assert.equal(parsedL2[1].beats.length, 2);
  assert.ok(parsedL2[1].emotionalRhythm.includes("hình tượng trực quan"));

  const sampleL3 = `# Level 3
## Quyển I: Khởi Nguyên Và Ánh Sáng Đầu Tiên (67 Chương)
### Chương 1: Khởi Nguyên Của Thế Giới
- Thuở ban đầu chưa có trái đất.
- Michael đẩy lùi phe Lucifer.

## Quyển V (Ngoại Truyện): Hạt Giống Yêu Thương Đêm Đông (10 Chương)
### Chương 1: Cậu Bé Thành Patara Và Tiếng Chuông Buổi Sáng
- Cậu bé Nicholas lớn lên tại thành cảng Patara.
- Lặng lẽ giúp đỡ người nghèo khó.
`;
  const parsedL3 = parseLevel3Markdown(sampleL3);
  assert.equal(parsedL3["quyen-1-chuong-01"].length, 2);
  assert.equal(parsedL3["quyen-5-chuong-01"].length, 2);
  assert.ok(parsedL3["quyen-5-chuong-01"][0].includes("Patara"));
});

test("Level 4: ProceduralIllustrator renders diverse pure visual SVGs with zero <text> hints across all 28 illustrations and 3 styles", () => {
  const seed = getSeedData();
  const styles: WaldorfArtStyle[] = ["wet-on-wet", "crayon", "chalkboard"];
  const distinctSvgs = new Set<string>();

  for (const ill of seed.stories[0].illustrations) {
    for (const style of styles) {
      const dataUrl = ProceduralIllustrator.generateArtSVG(ill, style);
      assert.ok(
        dataUrl.startsWith("data:image/svg+xml;utf8,"),
        `Expected SVG data URL for ${ill.id} (${style})`
      );
      if (style === "wet-on-wet") {
        distinctSvgs.add(dataUrl.replace(/wet-\d+-/g, "wet-x-"));
      }

      const decodedSvg = decodeURIComponent(dataUrl.replace("data:image/svg+xml;utf8,", ""));
      assert.ok(decodedSvg.includes("<svg"), "SVG must contain opening <svg tag");
      assert.ok(decodedSvg.includes("</svg>"), "SVG must contain closing </svg> tag");
      assert.ok(
        !/<text[\s>]/i.test(decodedSvg),
        `Level 4 artwork for ${ill.id} (${style}) must NOT contain <text> elements`
      );
    }
  }

  assert.ok(
    distinctSvgs.size >= 10,
    `Expected at least 10 distinct epic visual motifs across 28 illustrations, got ${distinctSvgs.size}`
  );
});

test("PDF Exporter: buildFullStoryPrintableHtml includes all 180 chapters and embeds all 28 Level 4 illustrations", () => {
  const seed = getSeedData();
  const story = seed.stories[0];

  const html = buildFullStoryPrintableHtml(story);
  assert.ok(html.includes(story.title));
  assert.ok(html.includes("Mục Lục Toàn Văn"));

  for (const ill of story.illustrations) {
    assert.ok(
      html.includes(`data-illustration-id="${ill.id}"`),
      `PDF HTML missing Level 4 illustration ${ill.id}`
    );
    const occurrences = html.split(`data-illustration-id="${ill.id}"`).length - 1;
    assert.equal(
      occurrences,
      1,
      `Illustration ${ill.id} should be embedded exactly once, found ${occurrences}`
    );
  }

  // Generated illustrations (1..21) use CDN PNG with SVG fallback; ungenerated (22..28) use SVG data URL
  assert.ok(html.includes(`${GENESIS_JSDELIVR_BASE_URL}/level-4-tranh-goi-nho/images/canh-01`));
  assert.ok(html.includes("data:image/svg+xml;utf8,"));

  // Check chapter coverage in PDF
  assert.ok(html.includes("Chương 1: Khởi Nguyên Của Thế Giới"));
  assert.ok(html.includes("Chương 67: Sem Và Các Thiên Thần"));
  assert.ok(html.includes("Chương 10: Từ Chiếc Áo Choàng Đỏ Thành Myra Đến Ông Già Noel Đêm Giáng Sinh"));

  // Book filter option
  const book4Html = buildFullStoryPrintableHtml(story, {
    bookId: "quyen-4",
    preferProceduralArt: true,
  });
  assert.ok(book4Html.includes("data-illustration-id=\"tranh-23\""));
  assert.ok(!book4Html.includes("data-illustration-id=\"tranh-01\""));
  assert.ok(!book4Html.includes(GENESIS_JSDELIVR_BASE_URL));
});

test("Rate-limit-safe repo sync: TTL guard, multi-CDN fallback order, and bounded concurrency", async () => {
  assert.equal(
    GENESIS_JSDELIVR_BASE_URL,
    "https://cdn.jsdelivr.net/gh/xuvivn/from-genesis-to-nativity@main"
  );

  const defaultCandidates = getCandidateRepoBaseUrls();
  assert.deepEqual(defaultCandidates, [GENESIS_JSDELIVR_BASE_URL, GENESIS_RAW_BASE_URL]);
  assert.deepEqual(getCandidateRepoBaseUrls(GENESIS_RAW_BASE_URL), [
    GENESIS_JSDELIVR_BASE_URL,
    GENESIS_RAW_BASE_URL,
  ]);

  const now = Date.UTC(2026, 10, 17, 12, 0, 0);
  assert.equal(shouldAutoSyncRepo(undefined, now), true);
  assert.equal(shouldAutoSyncRepo("not-a-date", now), true);
  assert.equal(shouldAutoSyncRepo(new Date(now - 60_000).toISOString(), now), false);
  assert.equal(
    shouldAutoSyncRepo(new Date(now - REPO_SYNC_TTL_MS + 1000).toISOString(), now),
    false
  );
  assert.equal(shouldAutoSyncRepo(new Date(now - REPO_SYNC_TTL_MS).toISOString(), now), true);

  assert.deepEqual(await mapWithConcurrency([], 6, async (x) => x), []);

  let active = 0;
  let maxActive = 0;
  const inputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const outputs = await mapWithConcurrency(inputs, 3, async (item) => {
    active++;
    maxActive = Math.max(maxActive, active);
    await new Promise((r) => setTimeout(r, 5));
    active--;
    return item * 2;
  });

  assert.deepEqual(
    outputs,
    inputs.map((n) => n * 2)
  );
  assert.ok(maxActive <= 3 && maxActive >= 1, `Expected max concurrency <= 3, got ${maxActive}`);
});

test("ProceduralIllustrator.escapeXml: safely escapes XML metacharacters", () => {
  const escaped = ProceduralIllustrator.escapeXml(`<script>alert("XSS")</script> & 'test'`);
  assert.equal(escaped, "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; &apos;test&apos;");
});

test("paginatePassage: splits chapters into screen-sized pages respecting text size budgets and preserving all text", () => {
  assert.deepEqual(paginatePassage("   ", "md"), [""]);

  const shortText = "Ngày xưa thật xưa, ánh sáng tỏa rạng khắp tầng không.";
  assert.deepEqual(paginatePassage(shortText, "md"), [shortText]);

  const paragraphs = Array.from({ length: 6 }, (_, i) =>
    `Đoạn ${i + 1}: Ngày xưa khi mặt đất còn chưa có hình hài, ánh sáng ấm áp lan tỏa qua từng tầng mây bạc. Những cơn gió nhẹ thổi qua triền đồi xanh mướt và đánh thức muôn loài dậy đón bình minh rực rỡ.`
  );
  const longPassage = paragraphs.join("\n\n");

  const smPages = paginatePassage(longPassage, "sm");
  const mdPages = paginatePassage(longPassage, "md");
  const lgPages = paginatePassage(longPassage, "lg");

  assert.ok(mdPages.length >= 2, `Expected multiple pages for md, got ${mdPages.length}`);
  assert.ok(lgPages.length >= mdPages.length, "Large text size should produce >= pages than medium");
  assert.ok(mdPages.length >= smPages.length, "Medium text size should produce >= pages than small");

  const normalizeWs = (s: string) => s.replace(/\s+/g, " ").trim();
  assert.equal(normalizeWs(smPages.join(" ")), normalizeWs(longPassage));
  assert.equal(normalizeWs(mdPages.join(" ")), normalizeWs(longPassage));
  assert.equal(normalizeWs(lgPages.join(" ")), normalizeWs(longPassage));

  // Long single paragraph split at sentence boundaries
  const singleLongPara = Array.from(
    { length: 12 },
    (_, i) => `Câu thứ ${i + 1} kể về hành trình vượt qua thung lũng ánh sáng trong buổi sớm mai.`
  ).join(" ");
  const sentencePages = paginatePassage(singleLongPara, "md");
  assert.ok(sentencePages.length >= 2, "Expected long paragraph to split across pages at sentence boundaries");
  assert.equal(normalizeWs(sentencePages.join(" ")), normalizeWs(singleLongPara));
});
