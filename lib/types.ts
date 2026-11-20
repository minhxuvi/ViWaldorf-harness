export type WaldorfArtStyle = "wet-on-wet" | "crayon" | "chalkboard";
export type PracticeLevel = 1 | 2 | 3 | 4;

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
  totalChapters: number;
  level0File: string;
  level1File: string;
  level2File: string;
}

/** Mục đọc thêm: Bối cảnh & Linh hồn câu chuyện (level-0-khong-gian-boi-canh/) */
export interface StorySoulContext {
  culturalSpirit: string;
  storytellingRhythm: string;
  ageMetaphor: string;
  pronunciations: PronunciationGuideItem[];
  overviewMarkdown?: string;
  overviewPath?: string;
  bookSouls?: Record<string, StorySoulContext>;
  ancientBooks?: AncientBookItem[];
}

/** Level 2: Dàn ý chi tiết theo chương */
export interface SceneDetailedOutline {
  characters: string[];
  localizedDetails: string[];
  emotionalRhythm: string;
  beats: string[];
}

export interface SceneLevelPaths {
  level0Overview: string;
  level0Book: string;
  level1: string;
  level2: string;
  level3: string;
  level4Gallery: string;
  level4Image: string;
  level4PromptSpec: string;
}

/** Level 4: 28 bức tranh gợi nhớ theo Cụm Chương */
export interface StoryIllustration {
  id: string; // "tranh-01" .. "tranh-28"
  ord: number; // 1 .. 28
  bookId: string; // "quyen-1" .. "quyen-5"
  chaptersRef: string; // vd: "Chương 1–2"
  title: string;
  artStyle: WaldorfArtStyle;
  repoImage: string;
  imageGenerated: boolean;
  imagePath?: string | null;
}

/** Đại diện cho từng Chương trong 180 Chương của bộ sử thi */
export interface StoryScene {
  id: string;
  ord: number; // global_number 1..180
  chapterNumber: number; // chapter_number trong từng Quyển
  bookId: string;
  section?: string;
  illustrationId?: string;
  slug?: string;
  isEpilogue?: boolean;
  title: string;
  /** Level 1: Toàn văn đọc thành tiếng cho chương */
  passage: string;
  /** Level 1: Lưu ý giọng kể riêng của chương */
  voiceNote: string;
  /** Level 2: Dàn ý chi tiết */
  detailedOutline: SceneDetailedOutline;
  /** Level 3: Các ý khung xương bám sát cốt truyện gốc */
  summaryPoints: string[];
  /** Level 4: Chất liệu tranh vẽ tay truyền thống (thuần hình ảnh, không chữ) */
  artStyle: WaldorfArtStyle;
  /** Đường dẫn ảnh tương đối trong repo (vd: level-4-tranh-goi-nho/images/canh-01-...png) */
  repoImage?: string;
  /** Trạng thái đã tạo ảnh PNG trong story-index.json của repo */
  imageGenerated?: boolean;
  /** Ảnh vẽ tay tùy chọn do người dùng tải lên (nếu có) */
  imagePath?: string | null;
  /** Đường dẫn thư mục/tệp tương ứng trên repo nguồn */
  levelPaths?: SceneLevelPaths;
}

export interface WaldorfStory {
  id: string;
  language?: "vi" | "en" | "zh";
  title: string;
  titleEn?: string;
  sourceInfo: string;
  targetAge: string;
  styleReference?: string;
  goal: string;
  defaultArtStyle: WaldorfArtStyle;
  repoUrl?: string;
  rawBaseUrl?: string;
  lastSyncedAt?: string;
  books?: StoryBookMeta[];
  /** Mục đọc thêm: Bối cảnh & Linh hồn câu chuyện */
  soul: StorySoulContext;
  /** Level 4: 28 bức tranh minh họa theo Cụm Chương */
  illustrations: StoryIllustration[];
  /** Level 1–3: Danh sách 180 Chương */
  scenes: StoryScene[];
}

export interface VoiceRecording {
  id: string;
  storyId: string;
  level?: PracticeLevel;
  sceneOrd: number;
  label: string;
  ancientBookId?: string;
  ancientBookTitle?: string;
  audioUrl: string;
  mimeType?: string;
  durationSeconds: number;
  createdAt: string;
}

export interface WaldorfData {
  stories: WaldorfStory[];
  storiesByLang?: Partial<Record<"vi" | "en" | "zh", WaldorfStory>>;
  updatedAt?: string;
  version?: string;
}

export interface ReadingProgress {
  storyId: string;
  selectedBookId: string;
  activeLevel: PracticeLevel;
  sceneId: string;
  sceneIndex: number;
  illustrationId: string;
  illustrationIndex: number;
  level1FlowMode: "scene" | "full";
  level1TextSize: "sm" | "md" | "lg";
  level3Scope: "all" | "current";
  showContextSection: boolean;
  scrollY: number;
  scrollRatio: number;
  updatedAt: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  googleConnected: boolean;
  createdAt: string;
}

export type FeedbackStatus = "open" | "in_progress" | "answered" | "closed";

export type FeedbackDevelopmentStatus =
  | "none"
  | "considering"
  | "planned"
  | "in_progress"
  | "implemented"
  | "declined";

export interface FeedbackMessageItem {
  id: number;
  threadId: number;
  body: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    isEditorial: boolean;
  };
}

export interface FeedbackThreadItem {
  id: number;
  title: string;
  body: string;
  chapterRef?: string | null;
  status: FeedbackStatus;
  development: {
    status: FeedbackDevelopmentStatus;
    openspecChange?: string | null;
    githubIssueUrl?: string | null;
    githubPrUrl?: string | null;
    implementedAt?: string | null;
    deployedAt?: string | null;
  };
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
  messagesCount?: number;
  messages?: FeedbackMessageItem[];
}
