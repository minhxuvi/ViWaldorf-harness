import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getSeedData } from "../lib/seedData";
import { ProceduralIllustrator } from "../lib/art/proceduralIllustrator";
import {
  PRINT_ROOT_ID,
  buildEmbeddedPrintStyles,
  buildFullStoryPrintableHtml,
  hasFullStoryPassages,
} from "../lib/pdfExporter";
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
  EARTH_REPO_URL,
  EARTH_STORY_ID,
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_RAW_BASE_URL,
  GENESIS_REPO_URL,
  GENESIS_STORY_ID,
  LOCAL_REPO_API_BASE_URL,
  REPO_SYNC_TTL_MS,
  getCandidateRepoBaseUrls,
  mapWithConcurrency,
  parseLevel0BookMarkdown,
  parseLevel1Markdown,
  parseLevel2Markdown,
  parseLevel3Markdown,
  resolveLocaleRepoPath,
  shouldAutoSyncRepo,
} from "../lib/repoStoryLoader";
import {
  getLocalEarthRepoDir,
  getLocalGenesisRepoDir,
  resolveSafeLocalRepoFile,
} from "../lib/server/localRepo";
import { WaldorfArtStyle } from "../lib/types";
import {
  createIdleTimerState,
  getAudioFileExtension,
  getFinalRecordedDurationSeconds,
  getRecordedDisplaySeconds,
  getRecordedElapsedMs,
  pauseRecordingTimer,
  pickSupportedAudioMimeType,
  resumeRecordingTimer,
  startRecordingTimer,
  supportsMediaRecorderPause,
} from "../lib/voiceRecorder";
import {
  buildCanonicalRouteUrl,
  buildRouteDocumentTitle,
  getBookRoute,
  getChapterRoute,
  getChapterSegment,
  getChapterSlug,
  getSeedStories,
  getStoryRoute,
  resolveChapterRoute,
  resolveStoryPath,
  resolveStoryRoute,
} from "../lib/seoRoutes";

test("Minimal UI shell exposes compact practice controls and expandable utility panels in vi/en/zh", () => {
  const pageSource = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
  assert.ok(!pageSource.includes("<PageHeader"), "Story page must not render the legacy PageHeader");
  assert.ok(
    !pageSource.includes('<section className="hidden">'),
    "Story page must not keep dead hidden legacy header cards"
  );
  assert.equal(
    (pageSource.match(/<PdfExportDropdown\b/g) || []).length,
    1,
    "PDF export dropdown must have strictly one entry point inside Guide & Tools"
  );
  assert.ok(
    pageSource.includes("const [showContextSection, setShowContextSection] = useState<boolean>(false);"),
    "Context panel must stay collapsed by default"
  );
  assert.ok(
    !pageSource.includes("setShowContextSection(readingProgress.showContextSection);"),
    "Context panel must not reopen from saved reading progress"
  );
  assert.ok(
    pageSource.includes("const [showUtilitiesSection, setShowUtilitiesSection] = useState<boolean>(false);"),
    "Guide & Tools panel must stay collapsed by default"
  );
  assert.equal(
    (pageSource.match(/<LevelSelectDropdown\b/g) || []).length,
    1,
    "Top control row must render one compact practice-level dropdown"
  );
  assert.ok(
    !pageSource.includes("grid-cols-2 sm:grid-cols-4"),
    "Legacy 4-button level grid must be replaced by compact dropdown"
  );
  assert.ok(
    (pageSource.match(/<BookSelectDropdown\b/g) || []).length >= 4,
    "Compact BookSelectDropdown should serve all 4 practice levels"
  );
  assert.ok(!pageSource.includes("tapOrSwipeHint"), "Legacy fixed tap/swipe hints must not remain visible");
  assert.ok(!pageSource.includes("jumpToSceneHint"), "Legacy fixed level-3 hint must not remain visible");
  assert.ok(!pageSource.includes("swipeHint"), "Legacy fixed level-4 hint must not remain visible");
  assert.ok(
    pageSource.includes("ancient-text-reading-surface"),
    "Ancient texts must use a dedicated edge-to-edge reading surface"
  );
  assert.ok(
    pageSource.includes("ancientBookId: capturedAncientBook?.id"),
    "Ancient-text recordings must retain independent text context"
  );
  assert.ok(
    pageSource.includes("level: capturedAncientBook ? undefined : capturedLevel"),
    "Ancient-text recordings must not create or expose a Practice Level"
  );
  assert.ok(
    !pageSource.includes("activeAncientBook && (\\n                <div className=\"p-4 rounded-xl"),
    "Ancient text content must not stay in the legacy nested fixed-height card"
  );

  for (const langCode of ["vi", "en", "zh"] as const) {
    const copy = translations[langCode].story.utilities;
    assert.ok(translations[langCode].story.nav.levelSelectLabel.length > 0);
    assert.ok(copy.openButton.length > 0);
    assert.ok(copy.contextButton.length > 0);
    assert.ok(
      copy.epicSummary.includes("180") ||
      copy.epicSummary.includes("28") ||
      copy.epicSummary.includes("Luyện kể") ||
      copy.epicSummary.length > 0
    );
    assert.ok(translations[langCode].story.contextSection.ancientReaderBack.length > 0);
    assert.ok(translations[langCode].story.recorder.ancientTextPrefix.length > 0);
    assert.ok(
      !/\bai\b|trợ lý ai|人工智能/i.test(JSON.stringify(copy)),
      `${langCode} utilities copy must not mention AI`
    );
  }
});

test("Default seed opens Đẻ Đất Đẻ Nước and includes Từ Sáng Thế Đến Giáng Sinh", () => {
  const seed = getSeedData();
  assert.equal(seed.stories.length, 2, "Library must contain the two epic stories");

  const earthStory = seed.stories.find((story) => story.id === EARTH_STORY_ID);
  assert.ok(earthStory);
  assert.equal(earthStory.repoUrl, EARTH_REPO_URL);
  assert.equal(earthStory.books?.length, 6);
  assert.equal(earthStory.scenes.length, 28);
  assert.equal(earthStory.illustrations.length, 28);
  assert.equal(
    earthStory.illustrations.filter((il) => il.imageGenerated).length,
    0,
    "Earth illustrations remain ungenerated until real PNG art is added"
  );

  const story = seed.stories.find((story) => story.id === GENESIS_STORY_ID);
  assert.ok(story);
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

test("SEO routes resolve stable story, book, and chapter slugs across vi/en/zh without prefix duplication or collisions", () => {
  const stories = getSeedStories();
  const earth = stories.find((candidate) => candidate.id === EARTH_STORY_ID);
  const genesis = stories.find((candidate) => candidate.id === GENESIS_STORY_ID);
  assert.ok(earth);
  assert.ok(genesis);

  const genesisBook = genesis.books?.[0];
  const genesisScene = genesis.scenes[0];
  const earthScene = earth.scenes[0];
  assert.ok(genesisBook);

  // Clean chapter slugs without doubled chuong-N-chuong-N- prefix
  assert.equal(getStoryRoute(earth), "/truyen/de-dat-de-nuoc");
  assert.equal(getStoryRoute(genesis), "/truyen/tu-sang-the-den-giang-sinh");
  assert.equal(getBookRoute(genesis, genesisBook), `/truyen/tu-sang-the-den-giang-sinh/${genesisBook.slug}`);
  assert.equal(
    getChapterRoute(earth, earthScene),
    "/truyen/de-dat-de-nuoc/chuong-1-mo-dau-noi-mot-chuyen-doi-xua"
  );
  assert.equal(
    getChapterRoute(genesis, genesisScene),
    "/truyen/tu-sang-the-den-giang-sinh/chuong-1-khoi-nguyen-cua-the-gioi"
  );
  assert.ok(!getChapterRoute(earth, earthScene).includes("chuong-1-chuong-1-"));
  assert.ok(!getChapterRoute(genesis, genesisScene).includes("chuong-1-chuong-1-"));

  // Zero slug collisions across all 28 + 180 chapters and multilingual canonical stability
  for (const story of [earth, genesis]) {
    const seen = new Set<string>();
    for (const sc of story.scenes) {
      const route = getChapterRoute(story, sc);
      assert.ok(!seen.has(route), `Duplicate chapter route detected: ${route}`);
      seen.add(route);
      assert.equal(resolveStoryPath(route)?.sceneId, sc.id);
    }
    for (const bk of story.books || []) {
      const bookRoute = getBookRoute(story, bk);
      assert.equal(resolveStoryPath(bookRoute)?.bookId, bk.id);
      assert.equal(resolveStoryPath(bookRoute)?.sceneId, undefined);
    }
    assert.deepEqual(resolveStoryPath(getStoryRoute(story)), { storyId: story.id });
  }

  for (const langCode of ["en", "zh"] as const) {
    const localized = getSeedData(langCode).stories;
    const localizedEarth = localized.find((candidate) => candidate.id === EARTH_STORY_ID);
    const localizedGenesis = localized.find((candidate) => candidate.id === GENESIS_STORY_ID);
    assert.ok(localizedEarth && localizedGenesis);
    assert.equal(getStoryRoute(localizedEarth), getStoryRoute(earth));
    assert.equal(getBookRoute(localizedGenesis, localizedGenesis.books![0]), getBookRoute(genesis, genesisBook));
    assert.equal(getChapterRoute(localizedEarth, localizedEarth.scenes[0]), getChapterRoute(earth, earthScene));
    assert.equal(getChapterRoute(localizedGenesis, localizedGenesis.scenes[0]), getChapterRoute(genesis, genesisScene));
  }

  // Backward-compatible and full-segment resolution + invalid path rejection
  assert.equal(resolveStoryRoute("tu-sang-the-den-giang-sinh")?.id, genesis.id);
  assert.equal(
    resolveChapterRoute(genesis, `${genesisScene.ord}-${getChapterSlug(genesisScene)}`)?.id,
    genesisScene.id
  );
  assert.equal(
    resolveChapterRoute(genesis, getChapterSegment(genesisScene))?.id,
    genesisScene.id
  );
  assert.equal(resolveChapterRoute(genesis, "not-a-chapter"), undefined);
  assert.equal(resolveStoryPath("/truyen/de-dat-de-nuoc/1-mo-dau-noi-mot-chuyen-doi-xua"), undefined);
  assert.equal(resolveStoryPath("/truyen/unknown/chuong-1-x"), undefined);
  assert.equal(resolveStoryPath("/"), undefined);

  // Granular URL & document title helpers
  assert.equal(
    buildCanonicalRouteUrl({
      storyId: earth.id,
      bookId: earth.books?.[1]?.id,
      sceneId: earth.scenes[2]?.id,
      granularity: "story",
    }),
    "/truyen/de-dat-de-nuoc"
  );
  assert.equal(
    buildCanonicalRouteUrl({
      storyId: earth.id,
      bookId: earth.books?.[1]?.id,
      sceneId: earth.scenes[2]?.id,
      granularity: "book",
    }),
    `/truyen/de-dat-de-nuoc/${earth.books?.[1]?.slug}`
  );
  assert.equal(
    buildCanonicalRouteUrl({
      storyId: earth.id,
      bookId: earth.books?.[1]?.id,
      sceneId: earth.scenes[2]?.id,
      granularity: "chapter",
    }),
    getChapterRoute(earth, earth.scenes[2]!)
  );
  assert.ok(
    buildRouteDocumentTitle({
      story: earth,
      bookId: earth.books?.[0]?.id,
      scene: earthScene,
      granularity: "chapter",
      lang: "vi",
    }).includes(earthScene.title)
  );

  // Structural App Router & live History API wiring checks
  assert.ok(
    !fs.existsSync(path.join(process.cwd(), "app/truyen/[storySlug]/chuong-[chapterKey]/page.tsx")),
    "Colliding chuong-[chapterKey] route must be removed"
  );
  assert.ok(
    !fs.existsSync(path.join(process.cwd(), "app/truyen/[storySlug]/[bookSlug]/page.tsx")),
    "Separate [bookSlug] route must be replaced by unified [segment]"
  );
  const segmentRoutePath = path.join(process.cwd(), "app/truyen/[storySlug]/[segment]/page.tsx");
  assert.ok(fs.existsSync(segmentRoutePath), "Unified [segment] route must exist");
  const segmentRouteSrc = fs.readFileSync(segmentRoutePath, "utf8");
  assert.ok(segmentRouteSrc.includes("generateStaticParams"));
  assert.ok(segmentRouteSrc.includes("generateMetadata"));

  const pageSrc = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
  assert.ok(pageSrc.includes("buildCanonicalRouteUrl"));
  assert.ok(pageSrc.includes("window.history.pushState"));
  assert.ok(pageSrc.includes("window.history.replaceState"));
  assert.ok(pageSrc.includes('"popstate"'));
  assert.ok(pageSrc.includes("handleStorySelect"));
  assert.ok(
    !pageSrc.includes("}, [activeStoryId, initialRoute?.storyId, setActiveStoryId]);"),
    "Legacy activeStoryId feedback loop must be removed"
  );
});

test("Background & Practice levels: All 5 books, 180 chapters, and 28 illustrations have valid repo paths across vi/en/zh", () => {
  const seed = getSeedData();
  const story = seed.stories.find((candidate) => candidate.id === GENESIS_STORY_ID);
  assert.ok(story);

  for (const bk of story.books || []) {
    const bookSoul = story.soul.bookSouls?.[bk.id];
    assert.ok(bookSoul, `Missing bookSoul for ${bk.id}`);
    assert.ok(bookSoul.culturalSpirit.trim().length > 20, `${bk.id}: missing culturalSpirit`);
    assert.ok(bookSoul.storytellingRhythm.trim().length > 20, `${bk.id}: missing storytellingRhythm`);
    assert.ok(bookSoul.ageMetaphor.trim().length > 20, `${bk.id}: missing ageMetaphor`);
    assert.ok(bookSoul.pronunciations.length >= 3, `${bk.id}: must have pronunciation guides`);
    assert.ok(bk.level0File.startsWith("locales/vi/level-0-context/"));
    assert.ok(bk.level1File.startsWith("locales/vi/level-1-full-text/"));
    assert.ok(bk.level2File.startsWith("locales/vi/level-2-detailed-outline/"));
  }

  for (const sc of story.scenes) {
    assert.ok(sc.passage.trim().length > 20, `${sc.id}: missing passage`);
    assert.ok(sc.voiceNote.trim().length > 20, `${sc.id}: missing voiceNote`);
    assert.ok(sc.detailedOutline.characters.length >= 1, `${sc.id}: missing characters`);
    assert.ok(sc.detailedOutline.emotionalRhythm.trim().length > 10, `${sc.id}: missing emotionalRhythm`);
    assert.ok(sc.detailedOutline.beats.length >= 3, `${sc.id}: missing beats`);
    assert.ok(sc.summaryPoints.length >= 3, `${sc.id}: missing summaryPoints`);
    assert.ok(sc.levelPaths, `${sc.id}: missing levelPaths`);
    assert.ok(sc.levelPaths.level0Book.startsWith("locales/vi/level-0-context/"));
    assert.ok(sc.levelPaths.level1.startsWith("locales/vi/level-1-full-text/"));
    assert.ok(sc.levelPaths.level2.startsWith("locales/vi/level-2-detailed-outline/"));
    assert.equal(sc.levelPaths.level3, "locales/vi/level-3-summary-outline/chapter-summaries.md");
    assert.ok(sc.repoImage?.startsWith("assets/images/"));
  }

  const generatedCount = story.illustrations.filter((il) => il.imageGenerated).length;
  assert.equal(generatedCount, 28, "Expected all 28 illustrations tranh-01..tranh-28 to have imageGenerated=true");

  for (const langCode of ["en", "zh"] as const) {
    const localizedSeed = getSeedData(langCode).stories.find(
      (candidate) => candidate.id === GENESIS_STORY_ID
    );
    assert.ok(localizedSeed);
    assert.equal(localizedSeed.language, langCode);
    assert.equal(localizedSeed.scenes.length, 180);
    assert.equal(localizedSeed.illustrations.length, 28);
    assert.ok(localizedSeed.books?.[0].level1File.startsWith(`locales/${langCode}/level-1-full-text/`));
    assert.ok(localizedSeed.soul.ancientBooks?.[0].file.startsWith(`locales/${langCode}/level-0-context/ancient-texts/`));
  }
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
  const genesis = seed.stories.find((candidate) => candidate.id === GENESIS_STORY_ID);
  assert.ok(genesis);
  const styles: WaldorfArtStyle[] = ["wet-on-wet", "crayon", "chalkboard"];
  const distinctSvgs = new Set<string>();

  for (const ill of genesis.illustrations) {
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
  const story = seed.stories.find((candidate) => candidate.id === GENESIS_STORY_ID);
  assert.ok(story);

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

  // All 28 generated illustrations use CDN/local PNG with SVG fallback
  assert.ok(html.includes(`${GENESIS_JSDELIVR_BASE_URL}/assets/images/canh-01`));
  assert.ok(html.includes(`${GENESIS_JSDELIVR_BASE_URL}/assets/images/canh-28`));
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

  // Text-only option (without images)
  const textOnlyViHtml = buildFullStoryPrintableHtml(story, {
    includeImages: false,
    lang: "vi",
  });
  assert.ok(textOnlyViHtml.includes(story.title));
  assert.ok(textOnlyViHtml.includes("Mục Lục Toàn Văn"));
  assert.ok(textOnlyViHtml.includes("Bản thuần chữ (Không kèm ảnh)"));
  assert.ok(textOnlyViHtml.includes("Lưu ý giọng kể"));
  assert.ok(textOnlyViHtml.includes("Chương 1: Khởi Nguyên Của Thế Giới"));
  assert.ok(textOnlyViHtml.includes("Chương 67: Sem Và Các Thiên Thần"));
  assert.ok(textOnlyViHtml.includes("Chương 10: Từ Chiếc Áo Choàng Đỏ Thành Myra Đến Ông Già Noel Đêm Giáng Sinh"));
  assert.ok(!textOnlyViHtml.includes("data-illustration-id="));
  assert.ok(!textOnlyViHtml.includes("<img "));

  const textOnlyEnHtml = buildFullStoryPrintableHtml(story, {
    includeImages: false,
    lang: "en",
  });
  assert.ok(textOnlyEnHtml.includes("Text-Only Edition (No Images)"));
  assert.ok(!textOnlyEnHtml.includes("data-illustration-id="));
  assert.ok(!textOnlyEnHtml.includes("<img "));

  const zhSeed =
    getSeedData("zh").stories.find((candidate) => candidate.id === GENESIS_STORY_ID);
  assert.ok(zhSeed);
  const zhPdfWithImages = buildFullStoryPrintableHtml(zhSeed, {
    includeImages: true,
    lang: "zh",
  });
  assert.ok(zhPdfWithImages.includes("全文目录"));
  assert.ok(zhPdfWithImages.includes("插画 01"));
  assert.ok(zhPdfWithImages.includes("讲演提示"));

  const textOnlyZhHtml = buildFullStoryPrintableHtml(zhSeed, {
    includeImages: false,
    lang: "zh",
  });
  assert.ok(textOnlyZhHtml.includes("纯文本版（无插画）"));
  assert.ok(!textOnlyZhHtml.includes("<img "));

  // Full-passage guard must reject unsynced seed placeholders
  assert.equal(hasFullStoryPassages(story), false);
  assert.equal(
    hasFullStoryPassages({ ...story, lastSyncedAt: "2026-11-18T10:00:00.000Z" }),
    false
  );

  // Valid synced 180-chapter story passes full-passage guard
  const syncedStory = {
    ...story,
    lastSyncedAt: "2026-11-18T10:00:00.000Z",
    scenes: story.scenes.map((sc) => ({
      ...sc,
      passage: `Toàn văn đầy đủ của ${sc.title}. Câu chuyện được kể bằng nhịp điệu ấm áp.`,
    })),
  };
  assert.equal(hasFullStoryPassages(syncedStory), true);

  // Incomplete chapter count fails full-passage guard
  assert.equal(
    hasFullStoryPassages({ ...syncedStory, scenes: syncedStory.scenes.slice(0, 179) }),
    false
  );

  // Embedded top-level print root stylesheet isolates printing on mobile and desktop browsers
  const embeddedCss = buildEmbeddedPrintStyles();
  assert.ok(embeddedCss.includes(`#${PRINT_ROOT_ID}`));
  assert.ok(embeddedCss.includes(`body > *:not(#${PRINT_ROOT_ID})`));
  assert.ok(embeddedCss.includes("@media print"));
  assert.ok(embeddedCss.includes("@media screen"));
  assert.ok(embeddedCss.includes("list-style: decimal"));
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
  const story = seed.stories.find((candidate) => candidate.id === GENESIS_STORY_ID);
  assert.ok(story);

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
    const feedbackCopyZh = JSON.stringify(translations.zh.feedback);
    assert.ok(!/\bai\b|trợ lý ai/i.test(feedbackCopyVi), "Vietnamese feedback copy must not mention AI");
    assert.ok(!/\bai\b|assistant/i.test(feedbackCopyEn), "English feedback copy must not mention AI");
    assert.ok(!/\bai\b|人工智能|智能助手/i.test(feedbackCopyZh), "Chinese feedback copy must not mention AI");

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

test("Multilingual Markdown parsers & path resolver support vi, en, and zh", () => {
  assert.equal(resolveLocaleRepoPath("level-1-full-text/book-1-genesis-and-light.md", "en"), "locales/en/level-1-full-text/book-1-genesis-and-light.md");
  assert.equal(resolveLocaleRepoPath("assets/images/canh-01-khoi-nguyen-va-cuoc-chien-anh-sang.png", "zh"), "assets/images/canh-01-khoi-nguyen-va-cuoc-chien-anh-sang.png");
  assert.deepEqual(getCandidateRepoBaseUrls(undefined, { includeLocalApi: true }), [
    LOCAL_REPO_API_BASE_URL,
    GENESIS_JSDELIVR_BASE_URL,
    GENESIS_RAW_BASE_URL,
  ]);

  const sampleEnL0 = `# Level 0 — Book I
## 1. Cultural Atmosphere & Core Spirit
Book I carries listeners back to the earliest mythic age of Light and Music.
## 2. Distinctive Storytelling Rhythm (Ages 9–10)
- **Opening Voice:** Resonant and unhurried.
## 3. Touchpoints & Metaphors for Ages 9–10
- **Core Metaphor:** Like a flower reaching toward light.
## 4. Pronunciation Guide for Proper Names & Ancient Places
| Name in Text | Natural Read-Aloud Pronunciation (English) | Story Context |
| :--- | :--- | :--- |
| **Michael** | *MIKE-ul* | Archangel bearing the sword of light |
`;
  const parsedEnL0 = parseLevel0BookMarkdown(sampleEnL0, "en");
  assert.ok(parsedEnL0.culturalSpirit.includes("Light and Music"));
  assert.equal(parsedEnL0.pronunciations.length, 1);
  assert.equal(parsedEnL0.pronunciations[0].term, "Michael");

  const sampleZhL0 = `# Level 0 — 第一卷
## 1. 文化背景与核心精神
第一卷把听众带回到最原初的神话时代。
## 2. 9–10岁适用讲述节奏与声线
- **开篇序曲：** 声音洪亮而舒缓。
## 3. 9–10岁孩子的共鸣触点与核心隐喻
- **核心隐喻：** 人站在光明与黑暗之间，正像一朵花。
## 4. 专有名词与古地名读音指南
| 标准中文译名 | 拼音与朗读提示 | 出场语境 |
| :--- | :--- | :--- |
| **米迦勒**（Michael） | \`Mǐjiālè\` | 手持光明宝剑的总领天使 |
`;
  const parsedZhL0 = parseLevel0BookMarkdown(sampleZhL0, "zh");
  assert.ok(parsedZhL0.culturalSpirit.includes("神话时代"));
  assert.equal(parsedZhL0.pronunciations.length, 1);
  assert.ok(parsedZhL0.pronunciations[0].term.includes("米迦勒"));

  const sampleEnL1 = `### Chapter 1: The World's Beginning
Long, long ago, there was heaven above.
#### Storytelling Notes
- **Epic opening:** Read slowly.
---
### Chapter 2: Michael and the Dragon
Down in the dark abyss, evil spirits plotted.
#### Storytelling Notes
- **Contrast:** Clear voice for Michael.
`;
  const parsedEnL1 = parseLevel1Markdown(sampleEnL1, "en");
  assert.ok(parsedEnL1[1].passage.includes("Long, long ago"));
  assert.ok(parsedEnL1[1].voiceNote.includes("Read slowly"));
  assert.ok(parsedEnL1[2].passage.includes("dark abyss"));

  const sampleZhL1 = `### 第1章：世界的起源
很久很久以前，那时已经有一座天堂。
#### 讲演提示
- **开篇节奏：** 读得舒缓从容。
`;
  const parsedZhL1 = parseLevel1Markdown(sampleZhL1, "zh");
  assert.ok(parsedZhL1[1].passage.includes("很久很久以前"));
  assert.ok(parsedZhL1[1].voiceNote.includes("舒缓从容"));

  const sampleEnL2 = `### Chapter 1: The World's Beginning
- **Characters & Central Symbols:** The Creator, Lucifer, Michael, the scar on heaven's wall.
- **Detailed Plot Beats:**
  - In the beginning there was only heaven.
  - Michael drove Lucifer out.
- **Meaning / Storytelling Focus:** Explains pride and light.
`;
  const parsedEnL2 = parseLevel2Markdown(sampleEnL2, "en");
  assert.equal(parsedEnL2[1].characters.length, 4);
  assert.equal(parsedEnL2[1].beats.length, 2);
  assert.ok(parsedEnL2[1].emotionalRhythm.includes("pride and light"));

  const sampleZhL2 = `### 第1章：世界的起源
- **核心人物与象征意象：** 造物主、路西法、大天使们（米迦勒、加百列）、闪电之剑。
- **详细情节脉络：**
  - 太初之时唯有天堂。
  - 米迦勒击退路西法。
- **故事寓意与讲述重点：** 阐释光明与黑暗的分野。
`;
  const parsedZhL2 = parseLevel2Markdown(sampleZhL2, "zh");
  assert.deepEqual(parsedZhL2[1].characters, ["造物主", "路西法", "大天使们（米迦勒、加百列）", "闪电之剑"]);
  assert.equal(parsedZhL2[1].beats.length, 2);
  assert.ok(parsedZhL2[1].emotionalRhythm.includes("光明与黑暗"));

  const sampleMultiL3 = `## Book I: In the Beginning (67 Chapters)
### Chapter 1: The World's Beginning
- Heaven shone with light.
- Michael defended the wall.

## 第五卷（外传）：冬夜里爱的种子（10章）
### 第10章：从米拉城的红袍到平安夜的圣诞老人
- 圣尼古拉的传说化作圣诞老人。
`;
  const parsedMultiL3 = parseLevel3Markdown(sampleMultiL3);
  assert.equal(parsedMultiL3["quyen-1-chuong-01"].length, 2);
  assert.equal(parsedMultiL3["quyen-5-chuong-10"][0], "圣尼古拉的传说化作圣诞老人。");
});

test("Earth repo bridge & Level 4 truthfulness: loads 6 Acts and 28 Chapters without fake fallback art", () => {
  const earthDir = getLocalEarthRepoDir();
  if (!fs.existsSync(earthDir)) return;

  assert.equal(resolveSafeLocalRepoFile(["..", "ViWaldorf-harness", "DAO.md"], earthDir), null);
  assert.equal(resolveSafeLocalRepoFile(["private", "notes.md"], earthDir), null);

  const manifestSafe = resolveSafeLocalRepoFile(["languages.json"], earthDir);
  assert.ok(manifestSafe);
  const manifest = JSON.parse(fs.readFileSync(manifestSafe.filePath, "utf8")) as {
    total_books: number;
    total_chapters: number;
    total_illustrations: number;
  };
  assert.equal(manifest.total_books, 6);
  assert.equal(manifest.total_chapters, 28);
  assert.equal(manifest.total_illustrations, 28);

  for (const langCode of ["vi", "en", "zh"] as const) {
    const indexSafe = resolveSafeLocalRepoFile(["locales", langCode, "story-index.json"], earthDir);
    assert.ok(indexSafe, `Missing Earth ${langCode} story-index.json`);
    const indexJson = JSON.parse(fs.readFileSync(indexSafe.filePath, "utf8")) as {
      total_books: number;
      total_chapters: number;
      total_illustrations: number;
      books: Array<{ id: string }>;
      chapters: Array<{ id: string }>;
      illustrations: Array<{ id: string; image_generated: boolean }>;
    };
    assert.equal(indexJson.total_books, 6);
    assert.equal(indexJson.total_chapters, 28);
    assert.equal(indexJson.total_illustrations, 28);
    assert.equal(indexJson.books.length, 6);
    assert.equal(indexJson.chapters.length, 28);
    assert.equal(indexJson.illustrations.length, 28);
    assert.equal(
      indexJson.illustrations.filter((ill) => ill.image_generated).length,
      0,
      `${langCode}: Earth PNGs must remain ungenerated until real art exists`
    );
  }

  const seed = getSeedData();
  const earth = seed.stories.find((story) => story.id === EARTH_STORY_ID);
  assert.ok(earth);
  assert.equal(earth.scenes.length, 28);
  assert.equal(earth.illustrations.length, 28);
  assert.equal(earth.illustrations.filter((ill) => ill.imageGenerated).length, 0);

  const earthSynced = {
    ...earth,
    lastSyncedAt: "2026-11-20T10:00:00.000Z",
    scenes: earth.scenes.map((sc) => ({
      ...sc,
      passage: `Toàn văn đầy đủ của ${sc.title}.`,
    })),
  };
  assert.equal(hasFullStoryPassages(earthSynced), true);
  const earthPdf = buildFullStoryPrintableHtml(earthSynced, {
    includeImages: true,
    lang: "vi",
  });
  assert.ok(!earthPdf.includes("data-illustration-id="));
  assert.ok(!earthPdf.includes("<img "));
});

test("Local repo bridge & integration: safely resolves sibling from-genesis-to-nativity multilingual corpus and 28 PNGs", () => {
  const repoDir = getLocalGenesisRepoDir();
  if (!fs.existsSync(repoDir)) {
    return;
  }

  // Path traversal and private/hidden file rejection
  assert.equal(resolveSafeLocalRepoFile(["..", "ViWaldorf-harness", "DAO.md"], repoDir), null);
  assert.equal(resolveSafeLocalRepoFile([".git", "HEAD"], repoDir), null);
  assert.equal(resolveSafeLocalRepoFile(["private", "notes.md"], repoDir), null);
  assert.equal(resolveSafeLocalRepoFile(["locales", "vi", ".DS_Store"], repoDir), null);

  const langManifest = resolveSafeLocalRepoFile(["languages.json"], repoDir);
  assert.ok(langManifest, "languages.json must be resolvable via local repo bridge");
  const manifestJson = JSON.parse(fs.readFileSync(langManifest.filePath, "utf8")) as {
    total_books: number;
    total_chapters: number;
    total_illustrations: number;
    languages: Array<{ code: string; index_file: string }>;
  };
  assert.equal(manifestJson.total_books, 5);
  assert.equal(manifestJson.total_chapters, 180);
  assert.ok(
    manifestJson.total_illustrations === 28 || manifestJson.total_illustrations === 180,
    "Expected the cluster or chapter-level illustration schema"
  );
  assert.deepEqual(
    manifestJson.languages.map((l) => l.code),
    ["vi", "en", "zh"]
  );

  for (const langCode of ["vi", "en", "zh"] as const) {
    const indexSafe = resolveSafeLocalRepoFile(["locales", langCode, "story-index.json"], repoDir);
    assert.ok(indexSafe, `Missing story-index.json for ${langCode}`);
    const indexJson = JSON.parse(fs.readFileSync(indexSafe.filePath, "utf8")) as {
      levels: Array<{ ancient_books?: Array<{ file: string }> }>;
      books: Array<{ level_0_file: string; level_1_file: string; level_2_file: string; total_chapters: number }>;
      total_illustrations: number;
      illustrations: Array<{ id: string; image: string; image_generated: boolean }>;
      chapters: Array<{ id: string }>;
    };

    assert.equal(indexJson.chapters.length, 180, `${langCode}: expected 180 chapters`);
    const clusterIllustrations =
      indexJson.total_illustrations > 28
        ? indexJson.illustrations.filter((ill) => /(?:^|\/)canh-\d{2}-[^/]+\.png$/i.test(ill.image))
        : indexJson.illustrations;
    assert.equal(clusterIllustrations.length, 28, `${langCode}: expected 28 cluster illustrations`);
    assert.equal(indexJson.levels[0].ancient_books?.length, 25, `${langCode}: expected 25 ancient books`);

    for (const ill of clusterIllustrations) {
      assert.equal(ill.image_generated, true, `${langCode} ${ill.id}: expected image_generated=true`);
      const imgSegs = ill.image.split("/");
      assert.ok(resolveSafeLocalRepoFile(imgSegs, repoDir), `Missing image asset ${ill.image}`);
    }

    for (const bk of indexJson.books) {
      const l0Path = resolveLocaleRepoPath(bk.level_0_file, langCode);
      const l1Path = resolveLocaleRepoPath(bk.level_1_file, langCode);
      const l2Path = resolveLocaleRepoPath(bk.level_2_file, langCode);

      const l0Safe = resolveSafeLocalRepoFile(l0Path.split("/"), repoDir);
      const l1Safe = resolveSafeLocalRepoFile(l1Path.split("/"), repoDir);
      const l2Safe = resolveSafeLocalRepoFile(l2Path.split("/"), repoDir);
      assert.ok(l0Safe && l1Safe && l2Safe, `${langCode}: missing markdown files for ${bk.level_1_file}`);

      const parsedL0 = parseLevel0BookMarkdown(fs.readFileSync(l0Safe.filePath, "utf8"), langCode);
      assert.ok(parsedL0.pronunciations.length >= 2, `${langCode} ${bk.level_0_file}: expected pronunciations`);

      const parsedL1 = parseLevel1Markdown(fs.readFileSync(l1Safe.filePath, "utf8"), langCode);
      assert.equal(Object.keys(parsedL1).length, bk.total_chapters, `${langCode} ${bk.level_1_file}: chapter count mismatch`);

      const parsedL2 = parseLevel2Markdown(fs.readFileSync(l2Safe.filePath, "utf8"), langCode);
      assert.equal(Object.keys(parsedL2).length, bk.total_chapters, `${langCode} ${bk.level_2_file}: chapter count mismatch`);
    }

    const l3Safe = resolveSafeLocalRepoFile(
      ["locales", langCode, "level-3-summary-outline", "chapter-summaries.md"],
      repoDir
    );
    assert.ok(l3Safe, `${langCode}: missing Level 3 chapter-summaries.md`);
    const parsedL3 = parseLevel3Markdown(fs.readFileSync(l3Safe.filePath, "utf8"));
    assert.equal(Object.keys(parsedL3).length, 180, `${langCode}: expected 180 chapters in Level 3`);
  }
});

test("Voice Recorder Pause/Resume: excludes paused intervals, handles MIME/extensions, and wires UI & i18n without AI", () => {
  // 1. Timer state transitions across multiple pause/resume cycles
  const idle = createIdleTimerState();
  assert.equal(idle.status, "idle");
  assert.equal(getRecordedElapsedMs(idle, 5000), 0);

  // Idempotent pause/resume on idle does nothing
  assert.deepEqual(pauseRecordingTimer(idle, 5000), idle);
  assert.deepEqual(resumeRecordingTimer(idle, 5000), idle);

  // Start at t=1000, pause at t=4200 -> 3200ms active
  const seg1 = startRecordingTimer(1000);
  assert.equal(getRecordedDisplaySeconds(seg1, 4200), 3);
  const paused1 = pauseRecordingTimer(seg1, 4200);
  assert.equal(paused1.status, "paused");
  assert.equal(paused1.accumulatedMs, 3200);
  // Idempotent pause while already paused preserves accumulatedMs
  assert.deepEqual(pauseRecordingTimer(paused1, 9000), paused1);
  // Paused gap (4200 -> 64200 = 60s interruption) does not count
  assert.equal(getRecordedElapsedMs(paused1, 64200), 3200);
  assert.equal(getRecordedDisplaySeconds(paused1, 64200), 3);

  // Resume at t=64200 -> idempotent resume when recording does nothing
  const seg2 = resumeRecordingTimer(paused1, 64200);
  assert.equal(seg2.status, "recording");
  assert.deepEqual(resumeRecordingTimer(seg2, 65000), seg2);

  // Pause again at t=68500 -> +4300ms = 7500ms active total
  const paused2 = pauseRecordingTimer(seg2, 68500);
  assert.equal(paused2.accumulatedMs, 7500);
  assert.equal(getRecordedDisplaySeconds(paused2, 99999), 7);
  // Stopping directly while paused preserves active duration (rounded 7.5s -> 8s)
  assert.equal(getFinalRecordedDurationSeconds(paused2, 120000), 8);

  // Short take (<500ms) clamps to minimum 1 second
  const shortSeg = startRecordingTimer(1000);
  assert.equal(getFinalRecordedDurationSeconds(shortSeg, 1200), 1);

  // 2. MIME selection & file extension mapping
  assert.equal(
    pickSupportedAudioMimeType((m) => m === "audio/mp4"),
    "audio/mp4"
  );
  assert.equal(
    pickSupportedAudioMimeType((m) => m === "audio/webm" || m === "audio/webm;codecs=opus"),
    "audio/webm;codecs=opus"
  );
  assert.equal(
    pickSupportedAudioMimeType(() => {
      throw new Error("unsupported");
    }),
    ""
  );
  assert.equal(getAudioFileExtension("audio/mp4"), "m4a");
  assert.equal(getAudioFileExtension("audio/ogg;codecs=opus"), "ogg");
  assert.equal(getAudioFileExtension("audio/webm;codecs=opus"), "webm");
  assert.equal(getAudioFileExtension(undefined), "webm");

  // 3. Capability check for MediaRecorder.pause/resume
  assert.equal(supportsMediaRecorderPause(null), false);
  assert.equal(supportsMediaRecorderPause({ pause: () => {}, resume: () => {} }), true);
  assert.equal(
    supportsMediaRecorderPause({ pause: () => {} } as unknown as Pick<MediaRecorder, "pause" | "resume">),
    false
  );

  // 4. UI wiring & multilingual i18n checks (vi/en/zh, zero AI)
  const pageSource = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
  for (const token of [
    "recordingStatus",
    "pauseRecording",
    "resumeRecording",
    "stopRecording",
    "motion-safe:animate-pulse",
    "getAudioFileExtension",
  ]) {
    assert.ok(pageSource.includes(token), `app/page.tsx must wire ${token}`);
  }

  for (const langCode of ["vi", "en", "zh"] as const) {
    const recCopy = translations[langCode].story.recorder;
    assert.ok(recCopy.pauseBtn.length > 0, `${langCode}: missing pauseBtn`);
    assert.ok(recCopy.resumeBtn.length > 0, `${langCode}: missing resumeBtn`);
    assert.ok(recCopy.pausedStatus.length > 0, `${langCode}: missing pausedStatus`);
    assert.ok(recCopy.pauseUnsupportedNotice.length > 0, `${langCode}: missing pauseUnsupportedNotice`);
    assert.ok(recCopy.recordingErrorNotice.length > 0, `${langCode}: missing recordingErrorNotice`);
    assert.ok(
      !/\bai\b|trợ lý ai|人工智能/i.test(JSON.stringify(recCopy)),
      `${langCode} recorder copy must not mention AI`
    );
  }
});
