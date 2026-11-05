import { DialectCorrectionRule } from "../types";

export interface DialectAdaptationResult {
  adapted: string;
  appliedRules: string[];
}

export class DialectAdaptationEngine {
  /**
   * Applies stored dialect rules to text, adapting regional spoken phrases while preserving meaning.
   */
  public static apply(
    text: string,
    rules: DialectCorrectionRule[]
  ): DialectAdaptationResult {
    let result = text;
    const applied: string[] = [];

    for (const rule of rules) {
      if (!rule.rawPhrase || !rule.correctedPhrase) continue;
      // Unicode-aware word boundary matching supporting Vietnamese accents
      const escapedRaw = rule.rawPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escapedRaw}(?![\\p{L}\\p{N}])`, "giu");

      if (regex.test(result)) {
        result = result.replace(regex, rule.correctedPhrase);
        applied.push(`${rule.rawPhrase} → ${rule.correctedPhrase}`);
      }
    }

    return {
      adapted: result,
      appliedRules: applied,
    };
  }

  /**
   * Automatically extracts potential dialect replacement candidates between raw speech and user correction.
   */
  public static extractCandidateRule(
    rawText: string,
    correctedText: string,
    regionNote: string = "Vietnamese Regional Dialect"
  ): DialectCorrectionRule | null {
    const rawWords = rawText.trim().split(/\s+/).filter(Boolean);
    const corrWords = correctedText.trim().split(/\s+/).filter(Boolean);

    if (rawWords.length === 0 || corrWords.length === 0) return null;
    if (rawText.trim() === correctedText.trim()) return null;

    // Isolate the differing contiguous segment via common prefix and suffix trimming
    let start = 0;
    while (
      start < rawWords.length &&
      start < corrWords.length &&
      rawWords[start].toLowerCase() === corrWords[start].toLowerCase()
    ) {
      start++;
    }

    let rawEnd = rawWords.length - 1;
    let corrEnd = corrWords.length - 1;
    while (
      rawEnd >= start &&
      corrEnd >= start &&
      rawWords[rawEnd].toLowerCase() === corrWords[corrEnd].toLowerCase()
    ) {
      rawEnd--;
      corrEnd--;
    }

    const diffRaw = rawWords.slice(start, rawEnd + 1).join(" ");
    const diffCorr = corrWords.slice(start, corrEnd + 1).join(" ");

    if (
      diffRaw &&
      diffCorr &&
      diffRaw.split(/\s+/).length <= 5 &&
      diffCorr.split(/\s+/).length <= 5
    ) {
      return {
        id: `rule-${Date.now()}`,
        rawPhrase: diffRaw.toLowerCase(),
        correctedPhrase: diffCorr.toLowerCase(),
        regionNote,
        occurrences: 1,
        updatedAt: new Date().toISOString().split("T")[0],
      };
    }

    return null;
  }
}
