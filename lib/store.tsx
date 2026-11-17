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
  selectedStory: WaldorfStory | undefined;
  isSyncingRepo: boolean;
  syncError: string;
  syncNotice: string;
  syncFromRepo: (options?: { force?: boolean }) => Promise<WaldorfStory | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "viwaldorf_storytelling_v4_genesis_180";
const LEGACY_STORAGE_KEYS = [
  "viwaldorf_storytelling_v3_genesis",
  "viwaldorf_storytelling_v2",
  "viwaldorf_storytelling_v1",
];
const LANG_STORAGE_KEY = "viwaldorf_lang_v2";

function isValidStoryV4(story: unknown): story is WaldorfStory {
  if (!story || typeof story !== "object") return false;
  const s = story as Partial<WaldorfStory>;
  return (
    s.id === GENESIS_STORY_ID &&
    typeof s.title === "string" &&
    Boolean(s.soul) &&
    typeof s.soul?.culturalSpirit === "string" &&
    Array.isArray(s.illustrations) &&
    s.illustrations.length === 28 &&
    Array.isArray(s.scenes) &&
    s.scenes.length === 180 &&
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
  const prevScenesById = new Map(existing.scenes.map((sc) => [sc.id, sc]));
  const prevIllById = new Map((existing.illustrations || []).map((il) => [il.id, il]));

  return {
    ...synced,
    illustrations: synced.illustrations.map((il) => {
      const old = prevIllById.get(il.id);
      if (!old) return il;
      return {
        ...il,
        artStyle: old.artStyle || il.artStyle,
        imagePath: old.imagePath ?? il.imagePath,
      };
    }),
    scenes: synced.scenes.map((sc) => {
      const old = prevScenesById.get(sc.id);
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
  const [isSyncingRepo, setIsSyncingRepo] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string>("");
  const [syncNotice, setSyncNotice] = useState<string>("");

  const isSyncingInFlightRef = useRef<boolean>(false);
  const activeSyncPromiseRef = useRef<Promise<WaldorfStory | null> | null>(null);
  const lastSyncAttemptRef = useRef<number>(0);

  const persist = useCallback((newData: WaldorfData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.warn("Local storage write warning:", err);
    }
  }, []);

  const syncFromRepo = useCallback(
    async (options?: { force?: boolean }): Promise<WaldorfStory | null> => {
      if (isSyncingInFlightRef.current && activeSyncPromiseRef.current) {
        return activeSyncPromiseRef.current;
      }

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
        return null;
      }

      isSyncingInFlightRef.current = true;
      setIsSyncingRepo(true);
      setSyncError("");
      setSyncNotice("");

      const runPromise = (async (): Promise<WaldorfStory | null> => {
        try {
          const syncedStory = await fetchGenesisStoryFromRepo(GENESIS_JSDELIVR_BASE_URL, {
            preferFresh: Boolean(options?.force),
          });
          lastSyncAttemptRef.current = Date.now();
          let resolvedStory: WaldorfStory = syncedStory;
          setInternalData((prev) => {
            const existingRepoStory = prev.stories.find((s) => s.id === GENESIS_STORY_ID);
            const merged = mergeRepoStoryWithLocalPrefs(syncedStory, existingRepoStory);
            resolvedStory = merged;
            const updated: WaldorfData = {
              ...prev,
              stories: [merged],
              updatedAt: new Date().toISOString(),
              version: "4.0-genesis-180",
            };
            persist(updated);
            return updated;
          });
          return resolvedStory;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Không thể đồng bộ từ GitHub repo.";
          setSyncError(msg);
          return null;
        } finally {
          isSyncingInFlightRef.current = false;
          activeSyncPromiseRef.current = null;
          setIsSyncingRepo(false);
        }
      })();

      activeSyncPromiseRef.current = runPromise;
      return runPromise;
    },
    [lang, persist]
  );

  useEffect(() => {
    let repoLastSyncedAt: string | undefined;
    let hasRepoStoryInCache = false;

    try {
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
          isValidStoryV4(parsed.stories[0])
        ) {
          setInternalData({ ...parsed, stories: [parsed.stories[0]] });
          hasRepoStoryInCache = true;
          repoLastSyncedAt = parsed.stories[0].lastSyncedAt;
        }
      }
    } catch (err) {
      console.warn("Local storage load warning:", err);
    }

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

  const t = (translations[lang] || translations.vi) as (typeof translations)["vi"];
  const selectedStory = data.stories[0];

  return (
    <AppContext.Provider
      value={{
        data,
        updateData,
        lang,
        setLang,
        t,
        selectedStory,
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
