"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WaldorfData, WaldorfStory, AIProvider } from "./types";
import { getSeedData } from "./seedData";
import { translations, Language } from "./i18n";
import { LocalFileBridge } from "./sync/localBridge";
import { SyncCrypto } from "./sync/crypto";

interface AppContextType {
  data: WaldorfData;
  setData: (data: WaldorfData) => void;
  updateData: (updater: (prev: WaldorfData) => WaldorfData) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
  selectedStoryId: string;
  setSelectedStoryId: (id: string) => void;
  selectedStory: WaldorfStory | undefined;
  metaApiKey: string;
  setMetaApiKey: (key: string) => void;
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => void;
  syncPasskey: string;
  setSyncPasskey: (key: string) => void;
  isLocalFolderLinked: boolean;
  connectLocalFolder: () => Promise<boolean>;
  syncWithCloud: () => Promise<boolean>;
  syncStatus: "idle" | "syncing" | "success" | "error";
  syncMessage: string;
  resetToSeed: () => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "viwaldorf_data_v1";
const LANG_STORAGE_KEY = "viwaldorf_lang_v1";
const PASSKEY_STORAGE_KEY = "viwaldorf_sync_passkey";
const API_KEY_STORAGE_KEY = "viwaldorf_meta_key";
const AI_PROVIDER_STORAGE_KEY = "viwaldorf_ai_provider";

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setInternalData] = useState<WaldorfData>(getSeedData());
  const [lang, setLangState] = useState<Language>("en");
  const [selectedStoryId, setSelectedStoryId] = useState<string>("story-hoian-money");
  const [metaApiKey, setMetaApiKeyState] = useState<string>("");
  const [aiProvider, setAiProviderState] = useState<AIProvider>("meta");
  const [syncPasskey, setSyncPasskeyState] = useState<string>("");
  const [isLocalFolderLinked, setIsLocalFolderLinked] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from client storage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
      if (savedLang === "en" || savedLang === "vi") setLangState(savedLang);

      const savedPasskey = localStorage.getItem(PASSKEY_STORAGE_KEY);
      if (savedPasskey) setSyncPasskeyState(savedPasskey);

      const savedMetaKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedMetaKey) setMetaApiKeyState(savedMetaKey);

      const savedProvider = localStorage.getItem(AI_PROVIDER_STORAGE_KEY) as AIProvider | null;
      if (savedProvider === "meta" || savedProvider === "local") {
        setAiProviderState(savedProvider);
      } else {
        setAiProviderState("meta");
      }

      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData) as WaldorfData;
        if (parsed.stories && parsed.stories.length > 0) {
          setInternalData(parsed);
          setSelectedStoryId(parsed.stories[0].id);
        }
      }
    } catch (e) {
      console.warn("Storage init warning:", e);
    }
    setIsInitialized(true);
  }, []);

  // Save changes to localStorage and Local File Bridge (if linked)
  const persist = (newData: WaldorfData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn("Local storage write error:", e);
    }

    if (LocalFileBridge.isConnected()) {
      LocalFileBridge.writeFile(newData).catch((err) =>
        console.warn("Local bridge sync warning:", err)
      );
    }
  };

  const setData = (newData: WaldorfData) => {
    setInternalData(newData);
    persist(newData);
  };

  const updateData = (updater: (prev: WaldorfData) => WaldorfData) => {
    setInternalData((prev) => {
      const updated = updater(prev);
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

  const setMetaApiKey = (key: string) => {
    setMetaApiKeyState(key);
    try {
      if (key) localStorage.setItem(API_KEY_STORAGE_KEY, key);
      else localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch {}
  };

  const setAiProvider = (provider: AIProvider) => {
    setAiProviderState(provider);
    try {
      localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
    } catch {}
  };

  const setSyncPasskey = (passkey: string) => {
    setSyncPasskeyState(passkey);
    try {
      if (passkey) localStorage.setItem(PASSKEY_STORAGE_KEY, passkey);
      else localStorage.removeItem(PASSKEY_STORAGE_KEY);
    } catch {}
  };

  const connectLocalFolder = async (): Promise<boolean> => {
    try {
      const fileData = await LocalFileBridge.connectFolder();
      if (fileData && fileData.stories && fileData.stories.length > 0) {
        setInternalData(fileData);
        persist(fileData);
        setIsLocalFolderLinked(true);
        return true;
      }

      if (!LocalFileBridge.isConnected()) {
        setIsLocalFolderLinked(false);
        return false;
      }

      // If empty or newly created, write our current state to disk
      const writeOk = await LocalFileBridge.writeFile(data);
      if (writeOk) {
        setIsLocalFolderLinked(true);
        return true;
      }
      setIsLocalFolderLinked(false);
      return false;
    } catch (err: any) {
      console.error("Failed to connect local macOS folder:", err);
      setIsLocalFolderLinked(false);
      return false;
    }
  };

  const syncWithCloud = async (): Promise<boolean> => {
    if (!syncPasskey.trim()) {
      setSyncStatus("error");
      setSyncMessage("Please provide a Sync Passkey first.");
      return false;
    }

    setSyncStatus("syncing");
    setSyncMessage("Encrypting and syncing with cloud...");

    try {
      const tokenHash = await SyncCrypto.hashPasskey(syncPasskey);

      // Fetch remote state
      const getRes = await fetch(`/api/sync?token=${encodeURIComponent(tokenHash)}`);
      if (getRes.ok) {
        const getJson = await getRes.json();
        if (getJson.status === "ok" && getJson.payload) {
          try {
            const decrypted = await SyncCrypto.decrypt(getJson.payload, syncPasskey);
            const remoteData = JSON.parse(decrypted) as WaldorfData;
            if (remoteData.stories && remoteData.stories.length > 0) {
              setInternalData(remoteData);
              persist(remoteData);
              setSyncStatus("success");
              setSyncMessage("Synced with cloud! State updated from remote twin.");
              return true;
            }
          } catch (decryptErr) {
            console.warn("Could not decrypt remote data with this passkey:", decryptErr);
          }
        }
      }

      // Push current local state to cloud
      const plainJson = JSON.stringify(data);
      const encrypted = await SyncCrypto.encrypt(plainJson, syncPasskey);

      const postRes = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenHash, payload: encrypted }),
      });

      if (postRes.ok) {
        setSyncStatus("success");
        setSyncMessage("Local state encrypted and saved to cloud successfully!");
        return true;
      } else {
        throw new Error("Server responded with status " + postRes.status);
      }
    } catch (err: any) {
      setSyncStatus("error");
      setSyncMessage("Sync error: " + (err.message || String(err)));
      return false;
    }
  };

  const resetToSeed = () => {
    const seed = getSeedData();
    setData(seed);
    setSelectedStoryId(seed.stories[0]?.id || "");
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waldorf-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as WaldorfData;
      if (!parsed.stories || parsed.stories.length === 0) {
        throw new Error("Invalid or empty Waldorf data backup.");
      }
      setData(parsed);
      setSelectedStoryId(parsed.stories[0].id);
      return true;
    } catch (err) {
      console.error("Backup import error:", err);
      return false;
    }
  };

  const t = translations[lang] || translations.en;
  const selectedStory = data.stories.find((s) => s.id === selectedStoryId) || data.stories[0];

  return (
    <AppContext.Provider
      value={{
        data,
        setData,
        updateData,
        lang,
        setLang,
        t,
        selectedStoryId,
        setSelectedStoryId,
        selectedStory,
        metaApiKey,
        setMetaApiKey,
        aiProvider,
        setAiProvider,
        syncPasskey,
        setSyncPasskey,
        isLocalFolderLinked,
        connectLocalFolder,
        syncWithCloud,
        syncStatus,
        syncMessage,
        resetToSeed,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
