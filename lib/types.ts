export type WaldorfArtStyle = "wet-on-wet" | "crayon" | "chalkboard";
export type AIProvider = "google" | "meta" | "local";

export interface StoryScene {
  id: string;
  ord: number;
  title: string;
  summary: string;
  keywords: string[];
  artStyle: WaldorfArtStyle;
  imagePrompt: string;
  imagePath?: string | null;
  imageSourceLabel: string;
  isGenerating?: boolean;
  generationError?: string | null;
}

export interface WaldorfStory {
  id: string;
  title: string;
  titleVi?: string;
  sourceText: string;
  sourceTextVi?: string;
  sourceInfo: string;
  ageRange: string;
  goal: string;
  defaultArtStyle: WaldorfArtStyle;
  scenes: StoryScene[];
}

export interface AudioDeliveryMetrics {
  durationSeconds: number;
  sampleRate: number;
  rmsDecibels: number;
  dynamicRangeDb: number;
  pauseRatio: number;
  pauseCount: number;
  estimatedPaceWPM: number;
  deliverySummary: string;
}

export type TranscriptSource = "remoteASR" | "demoSample" | "manualEdit" | "unavailable";

export interface PracticeAttempt {
  id: string;
  storyId: string;
  mode: "prompt" | "fading" | "free";
  audioPath?: string | null;
  rawTranscript: string;
  transcript: string;
  audioMetrics?: AudioDeliveryMetrics | null;
  appliedDialectRules: string[];
  storySnapshot: string;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  day: number; // 2..6 (Mon..Fri)
  startMinutes: number; // from midnight (e.g. 480 = 08:00)
  endMinutes: number;
  title: string;
  teacher?: string;
  objective?: string;
  kind: "hoc" | "sinh-hoat"; // Instructional vs Living Rhythm
}

export interface DialectCorrectionRule {
  id: string;
  rawPhrase: string;
  correctedPhrase: string;
  regionNote: string;
  occurrences: number;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  contentDelivered: string;
  attendanceNote: string;
  observationNote: string;
  assignmentNote: string;
  artifactNote: string;
  periodicReportNote: string;
}

export interface WaldorfStudent {
  id: string;
  name: string;
  birthYear: number;
  className: string;
  illustrative: boolean;
}

export interface WaldorfData {
  programPhilosophy: string;
  programGoals: string;
  gradeLevel: string;
  ageRange: string;
  students: WaldorfStudent[];
  stories: WaldorfStory[];
  attempts: PracticeAttempt[];
  timetable: TimetableEntry[];
  yearThemes: string[];
  dialectRules: DialectCorrectionRule[];
  journalEntries: JournalEntry[];
  updatedAt?: string;
  version?: string;
}

export type DocumentType =
  | "overallProgram"
  | "gradeProgram"
  | "alignmentMatrix"
  | "yearPlan"
  | "timetable"
  | "journalRecords";

export interface StoryFeedback {
  warmthNote: string;
  imageryNote: string;
  pacingNote: string;
  breathNote: string;
  encouragement: string;
}
