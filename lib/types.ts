export type WaldorfArtStyle = "wet-on-wet" | "crayon" | "chalkboard";
export type PracticeLevel = 0 | 1 | 2 | 3 | 4;
export type AgeVariantId = "6-10" | "3-5" | "11+";

export interface PronunciationGuideItem {
  term: string;
  pronunciation: string;
  meaning: string;
}

export interface AncientBookItem {
  id: string;
  title: string;
  category: "cuu-uoc" | "tan-uoc" | "co-thu" | string;
  file: string;
}

export interface StoryBookMeta {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  isEpilogue: boolean;
  illustrationStyle: string;
  level0File: string;
}

/** Level 0: Không gian bối cảnh & Linh hồn câu chuyện */
export interface StorySoulContext {
  culturalSpirit: string;
  storytellingRhythm: string;
  ageMetaphor: string;
  ageMetaphors?: Partial<Record<AgeVariantId, string>>;
  pronunciations: PronunciationGuideItem[];
  overviewMarkdown?: string;
  overviewPath?: string;
  bookSouls?: Record<string, StorySoulContext>;
  ancientBooks?: AncientBookItem[];
}

/** Level 2: Dàn ý chi tiết theo phân cảnh */
export interface SceneDetailedOutline {
  characters: string[];
  localizedDetails: string[];
  emotionalRhythm: string;
  beats: string[];
}

export interface SceneVariantContent {
  passage: string;
  voiceNote: string;
  detailedOutline: SceneDetailedOutline;
}

export interface SceneLevelPaths {
  level0Overview: string;
  level0Book: string;
  level1: Record<AgeVariantId, string>;
  level2: Record<AgeVariantId, string>;
  level3: string;
  level4Gallery: string;
  level4Image: string;
  level4PromptSpec: string;
}

export interface StoryScene {
  id: string;
  ord: number;
  slug?: string;
  bookId?: string;
  isEpilogue?: boolean;
  title: string;
  /** Level 1: Toàn văn đọc thành tiếng cho phân cảnh (mặc định 6–10 tuổi) */
  passage: string;
  /** Level 1: Lưu ý giọng kể riêng của phân cảnh */
  voiceNote: string;
  /** Level 2: Dàn ý chi tiết */
  detailedOutline: SceneDetailedOutline;
  /** Nội dung theo từng biến thể lứa tuổi từ repo (3–5, 6–10, 11+) */
  variants?: Partial<Record<AgeVariantId, SceneVariantContent>>;
  /** Level 3: 4–6 ý khung xương bám sát cốt truyện gốc */
  summaryPoints: string[];
  /** Level 4: Chất liệu tranh vẽ tay truyền thống (thuần hình ảnh, không chữ) */
  artStyle: WaldorfArtStyle;
  /** Đường dẫn ảnh tương đối trong repo (vd: level-4-tranh-goi-nho/images/canh-01-...png) */
  repoImage?: string;
  /** Trạng thái đã tạo ảnh PNG trong story-index.json của repo */
  imageGenerated?: boolean;
  /** Ảnh vẽ tay tùy chọn do người dùng tải lên (nếu có) */
  imagePath?: string | null;
  /** Đường dẫn thư mục/tệp tương ứng từng cấp độ trên repo nguồn */
  levelPaths?: SceneLevelPaths;
}

export interface WaldorfStory {
  id: string;
  title: string;
  titleEn?: string;
  sourceInfo: string;
  ageRange: string;
  goal: string;
  defaultArtStyle: WaldorfArtStyle;
  repoUrl?: string;
  rawBaseUrl?: string;
  lastSyncedAt?: string;
  books?: StoryBookMeta[];
  /** Level 0 */
  soul: StorySoulContext;
  /** Danh sách phân cảnh (28 phân cảnh từ repo hoặc 3–6+ phân cảnh truyện tự thêm) */
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
