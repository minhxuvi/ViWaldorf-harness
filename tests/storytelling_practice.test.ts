import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getSeedData } from "../lib/seedData";
import { ProceduralIllustrator } from "../lib/art/proceduralIllustrator";
import { buildFullStoryPrintableHtml } from "../lib/pdfExporter";
import { translations } from "../lib/i18n";
import {
  computeScrollRatio,
  computeTargetScrollY,
  createDefaultReadingProgress,
  isValidReadingProgress,
  mergeReadingProgress,
  resolveIllustrationIndexFromProgress,
  resolveSceneIndexFromProgress,
  sanitizeReadingProgress,
} from "../lib/readingProgress";
import {
  authenticateWithGoogleProfile,
  AuthError,
  buildGoogleAuthorizationUrl,
  createSession,
  destroySession,
  getUserBySessionToken,
  isGoogleOAuthConfigured,
  loginUser,
  registerUser,
  verifyFeedbackBearerToken,
} from "../lib/server/auth";
import {
  closeFeedbackThread,
  createFeedbackReply,
  createFeedbackThread,
  FeedbackActionError,
  getEditorialUser,
  getFeedbackThreadById,
  getUserReadingProgress,
  listFeedbackThreads,
  resetDbForTests,
  saveUserReadingProgress,
  updateFeedbackDevelopment,
} from "../lib/server/db";
import {
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_RAW_BASE_URL,
  GENESIS_REPO_URL,
  GENESIS_STORY_ID,
  REPO_SYNC_TTL_MS,
  getCandidateRepoBaseUrls,
  mapWithConcurrency,
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

test("Reading Progress: validates, resolves chapter/illustration by ID, computes scroll ratio, and merges by timestamp", () => {
  const seed = getSeedData();
  const story = seed.stories[0];

  const base = createDefaultReadingProgress(story.id);
  assert.equal(isValidReadingProgress(base), true);

  const book2Scenes = story.scenes.filter((sc) => sc.bookId === "quyen-2");
  const targetChapter = book2Scenes[12];
  assert.ok(targetChapter, "Expected chapter in Book 2");

  const resolvedIdx = resolveSceneIndexFromProgress(book2Scenes, {
    sceneId: targetChapter.id,
    sceneIndex: 999,
  });
  assert.equal(resolvedIdx, 12, "Must prioritize exact sceneId match over stale index");

  const fallbackIdx = resolveSceneIndexFromProgress(book2Scenes, {
    sceneId: "non-existent-id",
    sceneIndex: 5,
  });
  assert.equal(fallbackIdx, 5);

  const illIdx = resolveIllustrationIndexFromProgress(story.illustrations, {
    illustrationId: story.illustrations[9].id,
    illustrationIndex: 0,
  });
  assert.equal(illIdx, 9);

  const ratio = computeScrollRatio(500, 2000, 1000);
  assert.equal(ratio, 0.5);
  assert.equal(computeTargetScrollY(ratio, 0, 3000, 1000), 1000);
  assert.equal(computeTargetScrollY(0, 420, 2000, 1000), 420);

  const sanitized = sanitizeReadingProgress({
    storyId: story.id,
    selectedBookId: "quyen-2",
    activeLevel: 2,
    sceneId: targetChapter.id,
    sceneIndex: 12,
    illustrationId: story.illustrations[9].id,
    illustrationIndex: 9,
    level1FlowMode: "full",
    level1TextSize: "lg",
    level3Scope: "current",
    showContextSection: true,
    scrollY: 750,
    scrollRatio: 0.42,
    updatedAt: "2026-11-18T08:00:00.000Z",
  });
  assert.ok(sanitized);
  assert.equal(sanitized.level1TextSize, "lg");

  const older = { ...base, sceneId: "quyen-1-chuong-01", updatedAt: "2026-11-18T07:00:00.000Z" };
  const newer = { ...base, sceneId: targetChapter.id, updatedAt: "2026-11-18T08:00:00.000Z" };
  assert.equal(mergeReadingProgress(older, newer)?.sceneId, targetChapter.id);
  assert.equal(mergeReadingProgress(newer, older)?.sceneId, targetChapter.id);
});

test("Auth, Google SSO & Reading Progress Sync: registers, logs in, links Google accounts safely, and syncs progress", () => {
  resetDbForTests(":memory:");
  const prevEnv = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  };

  try {
    // 1. Register & login via Email + Password
    const parent = registerUser({
      name: "Mẹ An",
      email: "me.an@example.com",
      password: "waldorf-story-password",
    });
    assert.equal(parent.email, "me.an@example.com");
    assert.equal(parent.role, "member");

    const loggedIn = loginUser({
      email: "ME.AN@example.com",
      password: "waldorf-story-password",
    });
    assert.equal(loggedIn.id, parent.id);

    assert.throws(
      () => loginUser({ email: "me.an@example.com", password: "wrong-password" }),
      AuthError
    );

    // Editorial account cannot log in interactively
    const editorial = getEditorialUser();
    assert.equal(editorial.role, "editorial");
    assert.throws(
      () => loginUser({ email: editorial.email, password: "any-password" }),
      AuthError
    );

    // Session cookie roundtrip
    const session = createSession(Number(parent.id));
    const resolvedUser = getUserBySessionToken(session.token);
    assert.equal(resolvedUser?.id, parent.id);
    destroySession(session.token);
    assert.equal(getUserBySessionToken(session.token), null);

    // 2. Save and retrieve reading progress per user (respecting latest timestamp)
    const olderProg = {
      ...createDefaultReadingProgress(GENESIS_STORY_ID),
      selectedBookId: "quyen-1",
      sceneId: "quyen-1-chuong-03",
      sceneIndex: 2,
      scrollY: 320,
      scrollRatio: 0.25,
      updatedAt: "2026-11-18T08:00:00.000Z",
    };
    const newerProg = {
      ...olderProg,
      selectedBookId: "quyen-2",
      sceneId: "quyen-2-chuong-10",
      sceneIndex: 9,
      scrollY: 880,
      scrollRatio: 0.61,
      updatedAt: "2026-11-18T08:15:00.000Z",
    };
    saveUserReadingProgress(Number(parent.id), newerProg);
    saveUserReadingProgress(Number(parent.id), olderProg);
    const loadedProg = getUserReadingProgress(Number(parent.id));
    assert.equal(loadedProg?.sceneId, "quyen-2-chuong-10");
    assert.equal(loadedProg?.scrollY, 880);

    // 3. Google OAuth URL & safe account linking
    process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";

    assert.equal(isGoogleOAuthConfigured("http://localhost:3000"), true);
    const authUrl = new URL(buildGoogleAuthorizationUrl("csrf-state-123", "http://localhost:3000"));
    assert.equal(authUrl.origin, "https://accounts.google.com");
    assert.equal(authUrl.searchParams.get("scope"), "openid profile email");
    assert.equal(authUrl.searchParams.get("prompt"), "select_account");
    assert.equal(authUrl.searchParams.get("state"), "csrf-state-123");

    // Unverified Google email must be rejected
    assert.throws(
      () =>
        authenticateWithGoogleProfile({
          sub: "google-sub-unverified",
          email: "unverified@gmail.com",
          email_verified: false,
          name: "Unverified",
        }),
      AuthError
    );

    // New Gmail user is created cleanly
    const googleUser = authenticateWithGoogleProfile({
      sub: "google-sub-1",
      email: "thay.minh@gmail.com",
      email_verified: true,
      name: "Thầy Minh",
    });
    assert.equal(googleUser.google_id, "google-sub-1");
    assert.equal(googleUser.password_hash, null);

    // Existing non-Gmail account is NOT auto-linked when non-authoritative third-party email collides
    assert.throws(
      () =>
        authenticateWithGoogleProfile({
          sub: "google-sub-other",
          email: "me.an@example.com",
          email_verified: true,
          name: "Other",
        }),
      AuthError
    );

    // Existing @gmail.com password user IS safely linked once when google_id is null
    const gmailPasswordUser = registerUser({
      name: "Cô Lan",
      email: "co.lan@gmail.com",
      password: "secure-password-123",
    });
    const linked = authenticateWithGoogleProfile({
      sub: "google-sub-lan",
      email: "co.lan@gmail.com",
      email_verified: true,
      name: "Cô Lan Google",
    });
    assert.equal(linked.id, gmailPasswordUser.id);
    assert.equal(linked.google_id, "google-sub-lan");
    assert.equal(linked.name, "Cô Lan", "Must preserve original profile name");
  } finally {
    process.env.GOOGLE_CLIENT_ID = prevEnv.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_SECRET = prevEnv.GOOGLE_CLIENT_SECRET;
    process.env.GOOGLE_REDIRECT_URI = prevEnv.GOOGLE_REDIRECT_URI;
    resetDbForTests();
  }
});

test("Community Feedback (Zero-AI): supports threads, replies, editorial responses, development progress, and zero AI references", () => {
  resetDbForTests(":memory:");
  const prevToken = process.env.FEEDBACK_API_TOKEN;

  try {
    process.env.FEEDBACK_API_TOKEN = "editorial-secret-token";

    const author = registerUser({
      name: "Phụ huynh Hoa",
      email: "hoa@example.com",
      password: "waldorf-parent-pass",
    });
    const peer = registerUser({
      name: "Giáo viên Nam",
      email: "nam@example.com",
      password: "waldorf-teacher-pass",
    });

    const thread = createFeedbackThread({
      userId: Number(author.id),
      title: "Góp ý cỡ chữ khi đọc buổi tối",
      body: "Rất mong giữ cỡ chữ Lớn ổn định khi mở lại chương truyện.",
      chapterRef: "Quyển I · Chương 5",
    });
    assert.equal(thread.status, "open");
    assert.equal(thread.development.status, "none");

    // Member reply keeps status open
    const peerReply = createFeedbackReply({
      threadId: thread.id,
      userId: Number(peer.id),
      body: "Mình cũng thấy rất hữu ích khi đọc cho con trước giờ ngủ.",
    });
    assert.equal(peerReply.message.user.isEditorial, false);
    assert.equal(peerReply.thread.status, "open");

    // Bearer token guard and editorial response flips open -> answered
    assert.equal(verifyFeedbackBearerToken("Bearer wrong-token"), false);
    assert.equal(verifyFeedbackBearerToken("Bearer editorial-secret-token"), true);

    const editorial = getEditorialUser();
    const editorialReply = createFeedbackReply({
      threadId: thread.id,
      userId: Number(editorial.id),
      body: "Ban biên tập đã bổ sung lưu tự động cỡ chữ và vị trí đang đọc.",
      isEditorialResponse: true,
    });
    assert.equal(editorialReply.message.user.isEditorial, true);
    assert.equal(editorialReply.message.user.name, "Ban biên tập ViWaldorf");
    assert.equal(editorialReply.thread.status, "answered");

    // Development metadata lifecycle
    const updatedDev = updateFeedbackDevelopment(thread.id, {
      development_status: "implemented",
      openspec_change: "restore-reading-progress",
    });
    assert.equal(updatedDev.development.status, "implemented");
    assert.ok(updatedDev.development.implementedAt);

    // Filter threads by status
    const answeredThreads = listFeedbackThreads({ status: "answered", includeMessages: true });
    assert.equal(answeredThreads.length, 1);
    assert.equal(answeredThreads[0].messages?.length, 2);

    // Non-author cannot close thread; author can close thread
    assert.throws(
      () => closeFeedbackThread({ threadId: thread.id, userId: Number(peer.id) }),
      FeedbackActionError
    );
    const closed = closeFeedbackThread({ threadId: thread.id, userId: Number(author.id) });
    assert.equal(closed.status, "closed");

    // Replying to closed thread fails with 422
    assert.throws(
      () =>
        createFeedbackReply({
          threadId: thread.id,
          userId: Number(peer.id),
          body: "Bổ sung thêm",
        }),
      FeedbackActionError
    );

    // Strict Zero-AI check across feedback payloads, i18n copy, and UI component
    const loaded = getFeedbackThreadById(thread.id);
    const serializedThread = JSON.stringify(loaded);
    assert.ok(!/is_ai|trợ lý ai|\bai\b/i.test(serializedThread), "Feedback API payload must not mention AI");

    const feedbackCopyVi = JSON.stringify(translations.vi.feedback);
    const feedbackCopyEn = JSON.stringify(translations.en.feedback);
    assert.ok(!/\bai\b|trợ lý ai/i.test(feedbackCopyVi), "Vietnamese feedback copy must not mention AI");
    assert.ok(!/\bai\b|assistant/i.test(feedbackCopyEn), "English feedback copy must not mention AI");

    const feedbackComponentSrc = fs.readFileSync(
      path.join(process.cwd(), "components", "FeedbackSection.tsx"),
      "utf8"
    );
    assert.ok(
      !/Trợ lý AI|is_ai|\bAI\b/.test(feedbackComponentSrc),
      "FeedbackSection.tsx must not mention AI"
    );
  } finally {
    process.env.FEEDBACK_API_TOKEN = prevToken;
    resetDbForTests();
  }
});
