import test from "node:test";
import assert from "node:assert/strict";
import { getSeedData, segmentStoryLocally } from "../lib/seedData";
import { ProceduralIllustrator } from "../lib/art/proceduralIllustrator";
import { WaldorfArtStyle } from "../lib/types";

test("Level 0–3: All seed stories contain complete 5-level storytelling structures", () => {
  const seed = getSeedData();
  assert.ok(seed.stories.length >= 3, "Seed library must contain at least 3 stories");

  for (const story of seed.stories) {
    // Level 0: Không gian bối cảnh & Linh hồn câu chuyện
    assert.ok(story.soul.culturalSpirit.trim().length > 20, `${story.id}: missing culturalSpirit`);
    assert.ok(story.soul.storytellingRhythm.trim().length > 20, `${story.id}: missing storytellingRhythm`);
    assert.ok(story.soul.ageMetaphor.trim().length > 20, `${story.id}: missing ageMetaphor`);
    assert.ok(story.soul.pronunciations.length >= 3, `${story.id}: must have pronunciation guides`);

    for (const p of story.soul.pronunciations) {
      assert.ok(p.term.trim().length > 0);
      assert.ok(p.pronunciation.trim().length > 0);
      assert.ok(p.meaning.trim().length > 0);
    }

    // Scenes count
    assert.ok(story.scenes.length >= 4 && story.scenes.length <= 6, `${story.id}: expected 4–6 scenes`);

    for (const sc of story.scenes) {
      // Level 1: Toàn văn & Lưu ý giọng kể
      assert.ok(sc.passage.trim().length > 40, `${sc.id}: missing read-aloud passage`);
      assert.ok(sc.voiceNote.trim().length > 20, `${sc.id}: missing voiceNote`);

      // Level 2: Dàn ý chi tiết
      assert.ok(sc.detailedOutline.characters.length >= 1, `${sc.id}: missing characters`);
      assert.ok(sc.detailedOutline.localizedDetails.length >= 2, `${sc.id}: missing localizedDetails`);
      assert.ok(sc.detailedOutline.emotionalRhythm.trim().length > 10, `${sc.id}: missing emotionalRhythm`);
      assert.ok(sc.detailedOutline.beats.length >= 3, `${sc.id}: missing detailed beats`);

      // Level 3: Dàn ý tóm tắt (4–6 ý/phân cảnh)
      assert.ok(
        sc.summaryPoints.length >= 4 && sc.summaryPoints.length <= 6,
        `${sc.id}: expected 4–6 summaryPoints, got ${sc.summaryPoints.length}`
      );
    }
  }
});

test("Level 4: ProceduralIllustrator renders pure visual SVGs with zero <text> hints across all 3 styles", () => {
  const seed = getSeedData();
  const styles: WaldorfArtStyle[] = ["wet-on-wet", "crayon", "chalkboard"];

  for (const story of seed.stories) {
    for (const scene of story.scenes) {
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

  // Test single-paragraph text fallback segmentation
  const rawSinglePara =
    "Sáng sớm hoa mai nở vàng trước ngõ. Bé Na chạy ra tưới nước cho cây. Mẹ mỉm cười nhìn theo đầy âu yếm. Cả khu vườn rộn rã tiếng chim ca. Mùa xuân đã về thật ấm áp trên từng nhành lá. Gia đình sum vầy bên ấm trà nóng.";
  const singleStory = segmentStoryLocally({
    title: "",
    ageRange: "6–8 tuổi",
    artStyle: "wet-on-wet",
    rawText: rawSinglePara,
  });

  assert.ok(singleStory.scenes.length >= 3 && singleStory.scenes.length <= 6);
  for (const sc of singleStory.scenes) {
    assert.ok(sc.summaryPoints.length >= 4 && sc.summaryPoints.length <= 6);
  }
});
