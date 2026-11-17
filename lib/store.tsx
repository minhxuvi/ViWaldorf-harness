"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WaldorfData, WaldorfStory } from "./types";
import { getSeedData } from "./seedData";
import { translations, Language } from "./i18n";

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "viwaldorf_storytelling_v2";
const LANG_STORAGE_KEY = "viwaldorf_lang_v2";

function isValidStoryV2(story: any): story is WaldorfStory {
  return (
    Boolean(story) &&
    typeof story.id === "string" &&
    typeof story.title === "string" &&
    Boolean(story.soul) &&
    typeof story.soul.culturalSpirit === "string" &&
    Array.isArray(story.scenes) &&
    story.scenes.length > 0 &&
    story.scenes.every(
      (sc: any) =>
        typeof sc.passage === "string" &&
        typeof sc.voiceNote === "string" &&
        Boolean(sc.detailedOutline) &&
        Array.isArray(sc.summaryPoints)
    )
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setInternalData] = useState<WaldorfData>(() => getSeedData());
  const [lang, setLangState] = useState<Language>("vi");
  const [selectedStoryId, setSelectedStoryId] = useState<string>("story-hoian-money");

  useEffect(() => {
    try {
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
          parsed.stories.every(isValidStoryV2)
        ) {
          setInternalData(parsed);
          setSelectedStoryId(parsed.stories[0].id);
        }
      }
    } catch (err) {
      console.warn("Local storage load warning:", err);
    }
  }, []);

  const persist = (newData: WaldorfData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.warn("Local storage write warning:", err);
    }
  };

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
    setSelectedStoryId(seed.stories[0]?.id || "");
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
