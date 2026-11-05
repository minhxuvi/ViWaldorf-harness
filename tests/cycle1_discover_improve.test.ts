import test from "node:test";
import assert from "node:assert/strict";
import { DialectAdaptationEngine } from "../lib/dialect/dialectEngine";
import { ModelGateway } from "../lib/ai/modelGateway";
import { DialectCorrectionRule, StoryScene } from "../lib/types";

test("DialectAdaptationEngine.apply: matches Vietnamese dialect words with diacritics", () => {
  const rules: DialectCorrectionRule[] = [
    {
      id: "r1",
      rawPhrase: "giỏ sò",
      correctedPhrase: "vỏ sò",
      regionNote: "Quảng Nam dialect",
      occurrences: 1,
      updatedAt: "2026-11-04",
    },
    {
      id: "r2",
      rawPhrase: "đồng su",
      correctedPhrase: "đồng xu",
      regionNote: "Central dialect",
      occurrences: 1,
      updatedAt: "2026-11-04",
    },
    {
      id: "r3",
      rawPhrase: "chừ",
      correctedPhrase: "bây giờ",
      regionNote: "Hue dialect",
      occurrences: 1,
      updatedAt: "2026-11-04",
    },
    {
      id: "r4",
      rawPhrase: "đặng",
      correctedPhrase: "được",
      regionNote: "Southern dialect",
      occurrences: 1,
      updatedAt: "2026-11-04",
    },
  ];

  const input = "Bác thợ mộc nhặt giỏ sò và đồng su. Đến chừ mới làm đặng chiếc ghế.";
  const result = DialectAdaptationEngine.apply(input, rules);

  assert.equal(
    result.adapted,
    "Bác thợ mộc nhặt vỏ sò và đồng xu. Đến bây giờ mới làm được chiếc ghế."
  );
  assert.equal(result.appliedRules.length, 4);
  assert.ok(result.appliedRules.includes("giỏ sò → vỏ sò"));
  assert.ok(result.appliedRules.includes("đồng su → đồng xu"));
  assert.ok(result.appliedRules.includes("chừ → bây giờ"));
  assert.ok(result.appliedRules.includes("đặng → được"));
});

test("DialectAdaptationEngine.extractCandidateRule: accurately isolates changed phrases without whole-sentence bloat", () => {
  const raw = "Xưa ở xóm nhỏ ven sông Thu Bồn người ta nhặt giỏ sò trên bến thuyền";
  const corrected = "Xưa ở xóm nhỏ ven sông Thu Bồn người ta nhặt vỏ sò trên bến thuyền";

  const rule = DialectAdaptationEngine.extractCandidateRule(raw, corrected, "Test Region");
  assert.ok(rule !== null);
  assert.equal(rule.rawPhrase, "giỏ");
  assert.equal(rule.correctedPhrase, "vỏ");

  // Common prefix and suffix trimming isolates single word
  const rawPhrase = "Bà cụ nhắc bé Mây giữ lời ước hẹn xưa";
  const corrPhrase = "Bà cụ nhắc bé Mây giữ lời hứa hẹn xưa";
  const rule2 = DialectAdaptationEngine.extractCandidateRule(rawPhrase, corrPhrase);
  assert.ok(rule2 !== null);
  assert.equal(rule2.rawPhrase, "ước");
  assert.equal(rule2.correctedPhrase, "hứa");

  // Multi-word phrase isolation where both words change
  const rawMulti = "Người ta mang giỏ sò xanh đi đổi";
  const corrMulti = "Người ta mang thúng cá tươi đi đổi";
  const rule3 = DialectAdaptationEngine.extractCandidateRule(rawMulti, corrMulti);
  assert.ok(rule3 !== null);
  assert.equal(rule3.rawPhrase, "giỏ sò xanh");
  assert.equal(rule3.correctedPhrase, "thúng cá tươi");

  // Identical text returns null
  assert.equal(DialectAdaptationEngine.extractCandidateRule("cùng câu", "cùng câu"), null);
});

test("ModelGateway.generateSceneArtwork: provides authentic ProceduralIllustrator SVG when local or no key", async () => {
  const dummyScene: StoryScene = {
    id: "sc-test-1",
    ord: 1,
    title: "River Market Sunrise",
    summary: "Farmers and potters trade peacefully by the Thu Bồn river at dawn.",
    keywords: ["river", "pottery", "trade"],
    artStyle: "wet-on-wet",
    imagePrompt: "",
    imageSourceLabel: "",
  };

  // When provider is "local"
  const resultLocal = await ModelGateway.generateSceneArtwork({
    scene: dummyScene,
    style: "wet-on-wet",
    provider: "local",
    metaApiKey: "",
  });

  assert.ok(resultLocal.imageUrl?.startsWith("data:image/svg+xml;utf8,"));
  assert.equal(resultLocal.isAiGenerated, false);
  assert.ok(resultLocal.sourceLabel.includes("Minh họa thủ tục"));
  assert.equal(resultLocal.contextInfo?.provider, "local");
  assert.equal(resultLocal.contextInfo?.model, "ProceduralIllustrator (Local SVG)");

  // Crayon style procedural artwork
  const resultCrayon = await ModelGateway.generateSceneArtwork({
    scene: dummyScene,
    style: "crayon",
    provider: "local",
    metaApiKey: undefined,
  });

  assert.ok(resultCrayon.imageUrl?.startsWith("data:image/svg+xml;utf8,"));
  assert.equal(resultCrayon.isAiGenerated, false);
  assert.ok(resultCrayon.sourceLabel.includes("crayon"));

  // Chalkboard style procedural artwork
  const resultChalkboard = await ModelGateway.generateSceneArtwork({
    scene: dummyScene,
    style: "chalkboard",
    provider: "local",
    metaApiKey: "",
  });

  assert.ok(resultChalkboard.imageUrl?.startsWith("data:image/svg+xml;utf8,"));
  assert.equal(resultChalkboard.isAiGenerated, false);
  assert.ok(resultChalkboard.sourceLabel.includes("chalkboard"));
});
