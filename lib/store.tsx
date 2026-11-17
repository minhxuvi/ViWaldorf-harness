"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { WaldorfData, WaldorfStory } from "./types";
import { getSeedData } from "./seedData";
import { translations, Language } from "./i18n";
import {
  fetchGenesisStoryFromRepo,
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_STORY_ID,
  REPO_MANUAL_COOLDOWN_MS,
  shouldAutoSyncRepo,
} from "./repoStoryLoader";

interface AppContextType {
  data: WaldorfData;
  updateData: (updater: (prev: WaldorfData) => WaldorfData) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof translations)["vi"];
  selectedStoryId: string;
  setSelectedStoryId: (id: string) => void;
  selectedStory: WaldorfStory | undefined;
  resetToSeed: () => void;
  isSyncingRepo: boolean;
  syncError: string;
  syncNotice: string;
  syncFromRepo: (options?: { force?: boolean }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "viwaldorf_storytelling_v3_genesis";
const LEGACY_STORAGE_KEYS = ["viwaldorf_storytelling_v2", "viwaldorf_storytelling_v1"];
const LANG_STORAGE_KEY = "viwaldorf_lang_v2";

function isValidStoryV3(story: unknown): story is WaldorfStory {
  if (!story || typeof story !== "object") return false;
  const s = story as Partial<WaldorfStory>;
  return (
    typeof s.id === "string" &&
    typeof s.title === "string" &&
    Boolean(s.soul) &&
    typeof s.soul?.culturalSpirit === "string" &&
    Array.isArray(s.scenes) &&
    s.scenes.length > 0 &&
    s.scenes.every(
      (sc) =>
        Boolean(sc) &&
        typeof sc.passage === "string" &&
        typeof sc.voiceNote === "string" &&
        Boolean(sc.detailedOutline) &&
        Array.isArray(sc.summaryPoints)
    )
  );
}

function mergeRepoStoryWithLocalPrefs(
  synced: WaldorfStory,
  existing?: WaldorfStory
): WaldorfStory {
  if (!existing) return synced;
  const prevById = new Map(existing.scenes.map((sc) => [sc.id, sc]));
  return {
    ...synced,
    scenes: synced.scenes.map((sc) => {
      const old = prevById.get(sc.id);
      if (!old) return sc;
      return {
        ...sc,
        artStyle: old.artStyle || sc.artStyle,
        imagePath: old.imagePath ?? sc.imagePath,
      };
    }),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setInternalData] = useState<WaldorfData>(() => getSeedData());
  const [lang, setLangState] = useState<Language>("vi");
  const [selectedStoryId, setSelectedStoryId] = useState<string>(GENESIS_STORY_ID);
  const [isSyncingRepo, setIsSyncingRepo] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string>("");
  const [syncNotice, setSyncNotice] = useState<string>("");

  const isSyncingInFlightRef = useRef<boolean>(false);
  const lastSyncAttemptRef = useRef<number>(0);

  const persist = useCallback((newData: WaldorfData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.warn("Local storage write warning:", err);
    }
  }, []);

  const syncFromRepo = useCallback(
    async (options?: { force?: boolean }) => {
      if (isSyncingInFlightRef.current) return;

      const now = Date.now();
      if (
        options?.force &&
        lastSyncAttemptRef.current > 0 &&
        now - lastSyncAttemptRef.current < REPO_MANUAL_COOLDOWN_MS
      ) {
        const waitSec = Math.max(
          1,
          Math.ceil((REPO_MANUAL_COOLDOWN_MS - (now - lastSyncAttemptRef.current)) / 1000)
        );
        setSyncError("");
        setSyncNotice(
          lang === "en"
            ? `Recently synced — please wait ${waitSec}s before syncing again.`
            : `Vừa đồng bộ xong — vui lòng chờ ${waitSec} giây trước khi tải lại để tránh giới hạn truy cập.`
        );
        return;
      }

      isSyncingInFlightRef.current = true;
      setIsSyncingRepo(true);
      setSyncError("");
      setSyncNotice("");
      try {
        const syncedStory = await fetchGenesisStoryFromRepo(GENESIS_JSDELIVR_BASE_URL, {
          preferFresh: Boolean(options?.force),
        });
        lastSyncAttemptRef.current = Date.now();
        setInternalData((prev) => {
          const existingRepoStory = prev.stories.find((s) => s.id === GENESIS_STORY_ID);
          const merged = mergeRepoStoryWithLocalPrefs(syncedStory, existingRepoStory);
          const otherStories = prev.stories.filter((s) => s.id !== GENESIS_STORY_ID);
          const updated: WaldorfData = {
            ...prev,
            stories: [merged, ...otherStories],
            updatedAt: new Date().toISOString(),
            version: "3.0-repo-genesis",
          };
          persist(updated);
          return updated;
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Không thể đồng bộ từ GitHub repo.";
        setSyncError(msg);
      } finally {
        isSyncingInFlightRef.current = false;
        setIsSyncingRepo(false);
      }
    },
    [lang, persist]
  );

  useEffect(() => {
    let repoLastSyncedAt: string | undefined;
    let hasRepoStoryInCache = false;

    try {
      // Xoá hoàn toàn dữ liệu cache truyện mẫu cũ nếu còn tồn tại
      LEGACY_STORAGE_KEYS.forEach((oldKey) => {
        localStorage.removeItem(oldKey);
      });

      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
      if (savedLang === "vi" || savedLang === "en") {
        setLangState(savedLang);
      }

      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as WaldorfData;
        if (
          parsed &&
          Array.isArray(parsed.stories) &&
          parsed.stories.length > 0 &&
          parsed.stories.every(isValidStoryV3)
        ) {
          setInternalData(parsed);
          setSelectedStoryId(parsed.stories[0].id);
          const cachedRepoStory = parsed.stories.find((s) => s.id === GENESIS_STORY_ID);
          if (cachedRepoStory) {
            hasRepoStoryInCache = true;
            repoLastSyncedAt = cachedRepoStory.lastSyncedAt;
          }
        }
      }
    } catch (err) {
      console.warn("Local storage load warning:", err);
    }

    // Chỉ tự động đồng bộ qua CDN khi cache chưa có hoặc đã quá hạn TTL (6 giờ)
    if (!hasRepoStoryInCache || shouldAutoSyncRepo(repoLastSyncedAt)) {
      void syncFromRepo();
    } else if (repoLastSyncedAt) {
      const parsedMs = Date.parse(repoLastSyncedAt);
      if (!Number.isNaN(parsedMs)) {
        lastSyncAttemptRef.current = parsedMs;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = (updater: (prev: WaldorfData) => WaldorfData) => {
    setInternalData((prev) => {
      const updated = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      persist(updated);
      return updated;
    });
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {}
  };

  const resetToSeed = () => {
    lastSyncAttemptRef.current = 0;
    const seed = getSeedData();
    setInternalData(seed);
    persist(seed);
    setSelectedStoryId(seed.stories[0]?.id || GENESIS_STORY_ID);
    void syncFromRepo({ force: true });
  };

  const t = (translations[lang] || translations.vi) as (typeof translations)["vi"];
  const selectedStory =
    data.stories.find((s) => s.id === selectedStoryId) || data.stories[0];

  return (
    <AppContext.Provider
      value={{
        data,
        updateData,
        lang,
        setLang,
        t,
        selectedStoryId,
        setSelectedStoryId,
        selectedStory,
        resetToSeed,
        isSyncingRepo,
        syncError,
        syncNotice,
        syncFromRepo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
