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
import { AuthUser, ReadingProgress, WaldorfData, WaldorfStory } from "./types";
import { getSeedData } from "./seedData";
import { translations, Language } from "./i18n";
import {
  fetchGenesisStoryFromRepo,
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_STORY_ID,
  REPO_MANUAL_COOLDOWN_MS,
  shouldAutoSyncRepo,
} from "./repoStoryLoader";
import {
  loadLocalReadingProgress,
  mergeReadingProgress,
  saveLocalReadingProgress,
} from "./readingProgress";
import { hasFullStoryPassages } from "./pdfExporter";

export type AppActiveView = "story" | "feedback";

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
  // Auth & Navigation
  user: AuthUser | null;
  isAuthLoading: boolean;
  googleOAuthConfigured: boolean;
  authNotice: string;
  setAuthNotice: (msg: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  activeView: AppActiveView;
  setActiveView: (view: AppActiveView) => void;
  setAuthSession: (user: AuthUser | null, serverProgress?: ReadingProgress | null) => void;
  logout: () => Promise<void>;
  // Reading Progress
  readingProgress: ReadingProgress | null;
  isProgressLoaded: boolean;
  progressVersion: number;
  updateReadingProgress: (progress: ReadingProgress) => void;
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

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [googleOAuthConfigured, setGoogleOAuthConfigured] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<AppActiveView>("story");

  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [isProgressLoaded, setIsProgressLoaded] = useState<boolean>(false);
  const [progressVersion, setProgressVersion] = useState<number>(0);

  const isSyncingInFlightRef = useRef<boolean>(false);
  const activeSyncPromiseRef = useRef<Promise<WaldorfStory | null> | null>(null);
  const lastSyncAttemptRef = useRef<number>(0);

  const userRef = useRef<AuthUser | null>(null);
  const readingProgressRef = useRef<ReadingProgress | null>(null);
  const selectedStoryRef = useRef<WaldorfStory | undefined>(data.stories[0]);
  const progressSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  selectedStoryRef.current = data.stories[0];

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    readingProgressRef.current = readingProgress;
  }, [readingProgress]);

  const persist = useCallback((newData: WaldorfData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.warn("Local storage write warning:", err);
    }
  }, []);

  const pushProgressToServer = useCallback((progress: ReadingProgress, keepalive = false) => {
    if (!userRef.current || typeof fetch === "undefined") return;
    void fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readingProgress: progress }),
      keepalive,
    }).catch(() => {
      // Ignore offline/network sync failures; localStorage holds latest state
    });
  }, []);

  const updateReadingProgress = useCallback(
    (progress: ReadingProgress) => {
      readingProgressRef.current = progress;
      setReadingProgress(progress);
      saveLocalReadingProgress(progress);

      if (!userRef.current) return;
      if (progressSyncTimerRef.current) {
        clearTimeout(progressSyncTimerRef.current);
      }
      progressSyncTimerRef.current = setTimeout(() => {
        if (readingProgressRef.current) {
          pushProgressToServer(readingProgressRef.current);
        }
      }, 600);
    },
    [pushProgressToServer]
  );

  const applyMergedRemoteProgress = useCallback(
    (serverProgress: ReadingProgress | null | undefined) => {
      if (!serverProgress) {
        if (readingProgressRef.current && userRef.current) {
          pushProgressToServer(readingProgressRef.current);
        }
        return;
      }
      const currentLocal = readingProgressRef.current;
      const merged = mergeReadingProgress(currentLocal, serverProgress);
      if (!merged) return;

      const remoteWon =
        !currentLocal || Date.parse(merged.updatedAt) > Date.parse(currentLocal.updatedAt);

      if (remoteWon) {
        readingProgressRef.current = merged;
        setReadingProgress(merged);
        saveLocalReadingProgress(merged);
        setProgressVersion((v) => v + 1);
      } else if (userRef.current) {
        pushProgressToServer(merged);
      }
    },
    [pushProgressToServer]
  );

  const setAuthSession = useCallback(
    (nextUser: AuthUser | null, serverProgress?: ReadingProgress | null) => {
      userRef.current = nextUser;
      setUser(nextUser);
      if (nextUser) {
        applyMergedRemoteProgress(serverProgress);
      }
    },
    [applyMergedRemoteProgress]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    userRef.current = null;
    setUser(null);
  }, []);

  const syncFromRepo = useCallback(
    async (options?: { force?: boolean }): Promise<WaldorfStory | null> => {
      if (isSyncingInFlightRef.current && activeSyncPromiseRef.current) {
        return activeSyncPromiseRef.current;
      }

      const now = Date.now();
      const hasFullStory = hasFullStoryPassages(selectedStoryRef.current);
      if (
        options?.force &&
        hasFullStory &&
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
          selectedStoryRef.current = parsed.stories[0];
          setInternalData({ ...parsed, stories: [parsed.stories[0]] });
          hasRepoStoryInCache = true;
          repoLastSyncedAt = parsed.stories[0].lastSyncedAt;
        }
      }
    } catch (err) {
      console.warn("Local storage load warning:", err);
    }

    // 1. Restore browser reading progress immediately
    const localProg = loadLocalReadingProgress();
    if (localProg) {
      readingProgressRef.current = localProg;
      setReadingProgress(localProg);
      setProgressVersion((v) => v + 1);
    }
    setIsProgressLoaded(true);

    // 2. Surface OAuth callback error query param if present
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const authError = url.searchParams.get("authError");
      if (authError) {
        setAuthNotice(authError);
        setIsAuthModalOpen(true);
        url.searchParams.delete("authError");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    }

    // 3. Load auth session & merge remote progress if signed in
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const payload = (await res.json()) as {
            user?: AuthUser | null;
            readingProgress?: ReadingProgress | null;
            googleOAuthConfigured?: boolean;
          };
          setGoogleOAuthConfigured(Boolean(payload.googleOAuthConfigured));
          if (payload.user) {
            userRef.current = payload.user;
            setUser(payload.user);
            applyMergedRemoteProgress(payload.readingProgress);
          }
        }
      } catch {
        // Offline or auth endpoint unreachable; browser continues working offline
      } finally {
        setIsAuthLoading(false);
      }
    })();

    if (!hasRepoStoryInCache || shouldAutoSyncRepo(repoLastSyncedAt)) {
      void syncFromRepo();
    } else if (repoLastSyncedAt) {
      const parsedMs = Date.parse(repoLastSyncedAt);
      if (!Number.isNaN(parsedMs)) {
        lastSyncAttemptRef.current = parsedMs;
      }
    }

    // Flush latest reading progress on tab close/hide when signed in
    const handlePageHide = () => {
      if (progressSyncTimerRef.current) {
        clearTimeout(progressSyncTimerRef.current);
        progressSyncTimerRef.current = null;
      }
      if (userRef.current && readingProgressRef.current) {
        pushProgressToServer(readingProgressRef.current, true);
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      if (progressSyncTimerRef.current) {
        clearTimeout(progressSyncTimerRef.current);
      }
    };
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
        user,
        isAuthLoading,
        googleOAuthConfigured,
        authNotice,
        setAuthNotice,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeView,
        setActiveView,
        setAuthSession,
        logout,
        readingProgress,
        isProgressLoaded,
        progressVersion,
        updateReadingProgress,
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
