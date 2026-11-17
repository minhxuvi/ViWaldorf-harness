"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WaldorfData, WaldorfStory } from "./types";
import { getSeedData } from "./seedData";
import { translations, Language } from "./i18n";
import { fetchGenesisStoryFromRepo, GENESIS_STORY_ID } from "./repoStoryLoader";

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
  syncFromRepo: () => Promise<void>;
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

  const persist = useCallback((newData: WaldorfData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.warn("Local storage write warning:", err);
    }
  }, []);

  const syncFromRepo = useCallback(async () => {
    setIsSyncingRepo(true);
    setSyncError("");
    try {
      const syncedStory = await fetchGenesisStoryFromRepo();
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
      setIsSyncingRepo(false);
    }
  }, [persist]);

  useEffect(() => {
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
        }
      }
    } catch (err) {
      console.warn("Local storage load warning:", err);
    }

    // Tự động lấy nội dung mới nhất trực tiếp theo folder path từ GitHub repo
    void syncFromRepo();
  }, [syncFromRepo]);

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
    const seed = getSeedData();
    setInternalData(seed);
    persist(seed);
    setSelectedStoryId(seed.stories[0]?.id || GENESIS_STORY_ID);
    void syncFromRepo();
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
