import test from "node:test";
import assert from "node:assert/strict";
import { ModelGateway, getScenePassage } from "../lib/ai/modelGateway";
import { ProceduralIllustrator } from "../lib/art/proceduralIllustrator";
import { DocumentGenerator } from "../lib/documents/documentGenerator";
import { getSeedData } from "../lib/seedData";
import { DocumentType, StoryScene, WaldorfArtStyle } from "../lib/types";

test("ModelGateway.segmentLocallyByContext: adversarial inputs (empty, whitespace, single sentence)", () => {
  // Empty & whitespace
  assert.deepEqual(ModelGateway.segmentLocallyByContext("", "Empty", "wet-on-wet"), []);
  assert.deepEqual(ModelGateway.segmentLocallyByContext("   \n\t  ", "Empty", "wet-on-wet"), []);

  // Single sentence with no terminal punctuation
  const single = "A little seed rested quietly inside the warm earth";
  const scenesSingle = ModelGateway.segmentLocallyByContext(single, "Single", "crayon");
  assert.ok(scenesSingle.length >= 1);
  assert.equal(scenesSingle[0].summary, single);
  assert.ok(scenesSingle[0].title.includes("Scene 1"));

  // Narrative transitions in Vietnamese
  const vietnameseStory = `Ngày xửa ngày xưa ở một bản làng vùng cao có hai anh em. Một hôm người anh đi vào rừng nhặt củi và gặp một dòng suối trong vắt. Thế rồi một chú chim nhỏ cất tiếng hót đánh thức mùa xuân. Từ đó muôn hoa đua nở trên khắp sườn đồi.`;
  const scenesVi = ModelGateway.segmentLocallyByContext(vietnameseStory, "Bản Làng", "wet-on-wet");
  assert.ok(scenesVi.length >= 3 && scenesVi.length <= 5);
  assert.ok(scenesVi.every((s) => s.summary.length > 0));
  assert.ok(scenesVi.every((s) => s.title.startsWith("Scene ")));
});

test("getScenePassage: level-1 narrative text precedence and fallbacks", () => {
  const scenes: StoryScene[] = [
    {
      id: "s1",
      ord: 1,
      title: "Title 1",
      summary: "Summary 1",
      passage: "Explicit Passage 1",
      keywords: [],
      artStyle: "wet-on-wet",
      imagePrompt: "",
      imageSourceLabel: "",
    },
    {
      id: "s2",
      ord: 2,
      title: "Title 2",
      summary: "Summary 2",
      keywords: [],
      artStyle: "crayon",
      imagePrompt: "",
      imageSourceLabel: "",
    },
  ];

  // Explicit passage
  assert.equal(getScenePassage("Source text", scenes, 0), "Explicit Passage 1");

  // Fallback to summary when no paragraph matching
  assert.equal(getScenePassage("Source text line", scenes, 1), "Summary 2");

  // Fallback to matching paragraph when paragraph count equals scene count
  const twoParas = "First paragraph of story.\n\nSecond paragraph of story.";
  assert.equal(getScenePassage(twoParas, scenes, 1), "Second paragraph of story.");
});

test("ProceduralIllustrator: XML escaping prevents SVG / script injection", () => {
  const maliciousScene: StoryScene = {
    id: "sc-xss",
    ord: 1,
    title: `<script>alert("XSS")</script> & 'Quotes' "Double"`,
    summary: `Testing <svg onerror=alert(1)> & special characters`,
    keywords: ["test"],
    artStyle: "wet-on-wet",
    imagePrompt: "",
    imageSourceLabel: "",
  };

  const styles: WaldorfArtStyle[] = ["wet-on-wet", "crayon", "chalkboard"];

  for (const style of styles) {
    const dataUrl = ProceduralIllustrator.generateArtSVG(maliciousScene, style);
    assert.ok(dataUrl.startsWith("data:image/svg+xml;utf8,"));

    const decodedSvg = decodeURIComponent(dataUrl.replace("data:image/svg+xml;utf8,", ""));
    assert.ok(decodedSvg.includes("<svg"));
    assert.ok(decodedSvg.includes("</svg>"));

    // Verify malicious tags are strictly escaped
    assert.ok(!decodedSvg.includes("<script>"));
    assert.ok(decodedSvg.includes("&lt;script&gt;"));
    assert.ok(decodedSvg.includes("&amp;"));
    assert.ok(decodedSvg.includes("&apos;Quotes&apos;"));
    assert.ok(decodedSvg.includes("&quot;Double&quot;"));
  }
});

test("DocumentGenerator: all 6 classroom documents fulfill statutory sections with 0 missing headings", () => {
  const seed = getSeedData();
  const docTypes: DocumentType[] = [
    "overallProgram",
    "gradeProgram",
    "alignmentMatrix",
    "yearPlan",
    "timetable",
    "journalRecords",
  ];

  for (const type of docTypes) {
    const content = DocumentGenerator.generateDocument(seed, type, "en");
    const missing = DocumentGenerator.getMissingHeadings(content, type);
    assert.equal(
      missing.length,
      0,
      `Document "${type}" has missing statutory headings: ${missing.join(", ")}`
    );
  }
});

test("Timetable Integrity: seed schedule has zero overlaps and sums to exactly 2100 minutes", () => {
  const seed = getSeedData();
  const timetable = seed.timetable;

  let totalMinutes = 0;
  for (let day = 2; day <= 6; day++) {
    const dayPeriods = timetable
      .filter((e) => e.day === day)
      .sort((a, b) => a.startMinutes - b.startMinutes);

    assert.ok(dayPeriods.length > 0, `Day ${day} must have periods`);

    for (let i = 0; i < dayPeriods.length - 1; i++) {
      assert.ok(
        dayPeriods[i].endMinutes <= dayPeriods[i + 1].startMinutes,
        `Day ${day}: Overlap detected between "${dayPeriods[i].title}" and "${dayPeriods[i + 1].title}"`
      );
    }

    for (const p of dayPeriods) {
      assert.ok(p.startMinutes >= 480, "Day starts at or after 08:00");
      assert.ok(p.endMinutes <= 900, "Day ends at or before 15:00");
      totalMinutes += p.endMinutes - p.startMinutes;
    }
  }

  assert.equal(totalMinutes, 2100, "Total weekly minutes must equal exactly 2100");
});
