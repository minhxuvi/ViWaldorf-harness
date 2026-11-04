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
      // Case-insensitive regex match with word boundaries if possible
      const escapedRaw = rule.rawPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedRaw}\\b`, "gi");

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
    const rawWords = rawText.trim().split(/\s+/);
    const corrWords = correctedText.trim().split(/\s+/);

    if (rawWords.length !== corrWords.length) {
      // General phrase replacement
      if (rawText.trim() !== correctedText.trim()) {
        return {
          id: `rule-${Date.now()}`,
          rawPhrase: rawText.trim().toLowerCase(),
          correctedPhrase: correctedText.trim().toLowerCase(),
          regionNote,
          occurrences: 1,
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return null;
    }

    // Find first differing single-word or short phrase
    for (let i = 0; i < rawWords.length; i++) {
      if (rawWords[i].toLowerCase() !== corrWords[i].toLowerCase()) {
        return {
          id: `rule-${Date.now()}-${i}`,
          rawPhrase: rawWords[i].toLowerCase(),
          correctedPhrase: corrWords[i].toLowerCase(),
          regionNote,
          occurrences: 1,
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
    }

    return null;
  }
}
