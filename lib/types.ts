export type WaldorfArtStyle = "wet-on-wet" | "crayon" | "chalkboard";
export type PracticeLevel = 0 | 1 | 2 | 3 | 4;

export interface PronunciationGuideItem {
  term: string;
  pronunciation: string;
  meaning: string;
}

/** Level 0: Không gian bối cảnh & Linh hồn câu chuyện */
export interface StorySoulContext {
  culturalSpirit: string;
  storytellingRhythm: string;
  ageMetaphor: string;
  pronunciations: PronunciationGuideItem[];
}

/** Level 2: Dàn ý chi tiết theo phân cảnh */
export interface SceneDetailedOutline {
  characters: string[];
  localizedDetails: string[];
  emotionalRhythm: string;
  beats: string[];
}

export interface StoryScene {
  id: string;
  ord: number;
  title: string;
  /** Level 1: Toàn văn đọc thành tiếng cho phân cảnh */
  passage: string;
  /** Level 1: Lưu ý giọng kể riêng của phân cảnh */
  voiceNote: string;
  /** Level 2: Dàn ý chi tiết */
  detailedOutline: SceneDetailedOutline;
  /** Level 3: 4–6 ý khung xương bám sát cốt truyện gốc */
  summaryPoints: string[];
  /** Level 4: Chất liệu tranh vẽ tay truyền thống (thuần hình ảnh, không chữ) */
  artStyle: WaldorfArtStyle;
  /** Ảnh vẽ tay tùy chọn do người dùng tải lên (nếu có) */
  imagePath?: string | null;
}

export interface WaldorfStory {
  id: string;
  title: string;
  titleEn?: string;
  sourceInfo: string;
  ageRange: string;
  goal: string;
  defaultArtStyle: WaldorfArtStyle;
  /** Level 0 */
  soul: StorySoulContext;
  /** 4–6 phân cảnh */
  scenes: StoryScene[];
}

export interface VoiceRecording {
  id: string;
  storyId: string;
  level: PracticeLevel;
  sceneOrd: number;
  label: string;
  audioUrl: string;
  durationSeconds: number;
  createdAt: string;
}

export interface WaldorfData {
  stories: WaldorfStory[];
  updatedAt?: string;
  version?: string;
}
