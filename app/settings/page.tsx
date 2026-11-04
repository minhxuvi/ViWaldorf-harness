"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/lib/store";
import { DemoBanner, PageHeader } from "@/components/PageHeader";
import {
  Settings,
  HardDrive,
  Cloud,
  Key,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const {
    data,
    metaApiKey,
    setMetaApiKey,
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
    t,
  } = useApp();

  const [inputKey, setInputKey] = useState("");
  const [passkeyInput, setPasskeyInput] = useState(syncPasskey);
  const [keyNotice, setKeyNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveApiKey = () => {
    if (!inputKey.trim()) return;
    setMetaApiKey(inputKey.trim());
    setInputKey("");
    setKeyNotice("API Key saved securely in browser storage.");
    setTimeout(() => setKeyNotice(""), 3000);
  };

  const handleDeleteApiKey = () => {
    setMetaApiKey("");
    setKeyNotice("API Key removed.");
    setTimeout(() => setKeyNotice(""), 3000);
  };

  const handleSavePasskey = () => {
    setSyncPasskey(passkeyInput.trim());
  };

  const handleGeneratePasskey = () => {
    const words = [
      "lotus", "bamboo", "river", "sun", "lantern", "amber",
      "mountain", "breeze", "seed", "harvest", "forest", "clay"
    ];
    const generated = Array.from({ length: 4 })
      .map(() => words[Math.floor(Math.random() * words.length)])
      .join("-");
    setPasskeyInput(generated);
    setSyncPasskey(generated);
  };

  const handleBackupFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await importBackup(file);
    if (ok) alert("Data restored successfully!");
    else alert("Failed to restore backup file. Please verify JSON format.");
  };

  return (
    <div className="space-y-6">
      <DemoBanner />

      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      {/* SEAMLESS SYNCHRONIZATION HUB */}
      <div className="garden-card space-y-5 border-2 border-forest/30 bg-[#FDFBF7]">
        <div className="flex items-center gap-2 pb-3 border-b border-line">
          <RefreshCw className="w-5 h-5 text-forest" />
          <h2 className="font-serif text-lg font-bold text-forestDark">
            {t.settings.syncCardTitle}
          </h2>
        </div>

        {/* Local macOS Direct Link Mode */}
        <div className="p-4 rounded-xl bg-white border border-line space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-sm text-forestDark flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-forest" />
                Mode 1: Direct Local macOS Folder Sync (Zero-Network)
              </h3>
              <p className="text-xs text-inkSoft leading-relaxed">
                {t.settings.localSyncSubtitle}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              isLocalFolderLinked ? "bg-[#E3EFE0] text-forest" : "bg-[#F7ECD8] text-inkSoft"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLocalFolderLinked ? "bg-forest" : "bg-inkSoft"}`} />
              {isLocalFolderLinked ? "Linked" : "Not Linked"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={connectLocalFolder}
              className="btn-primary text-xs"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{t.settings.connectLocalBtn}</span>
            </button>
            {isLocalFolderLinked && (
              <span className="text-xs text-forest font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {t.settings.localFolderConnected}
              </span>
            )}
          </div>
        </div>

        {/* Remote Vercel Cloud Sync Mode */}
        <div className="p-4 rounded-xl bg-white border border-line space-y-3">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm text-forestDark flex items-center gap-2">
              <Cloud className="w-4 h-4 text-terra" />
              Mode 2: Encrypted Cloud Sync (/api/sync)
            </h3>
            <p className="text-xs text-inkSoft leading-relaxed">
              {t.settings.cloudSyncSubtitle}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-forestDark">
              {t.settings.syncPasskeyLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="e.g. lotus-bamboo-lantern-river"
                className="flex-1 px-3 py-2 rounded-lg border border-line text-xs font-mono"
              />
              <button
                onClick={handleGeneratePasskey}
                className="btn-ghost text-xs whitespace-nowrap"
              >
                {t.settings.generatePasskeyBtn}
              </button>
              <button
                onClick={handleSavePasskey}
                className="btn-primary text-xs whitespace-nowrap"
              >
                Save Passkey
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={syncWithCloud}
              disabled={syncStatus === "syncing" || !passkeyInput.trim()}
              className="btn-primary bg-terra hover:bg-[#a84736] border-terra text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
              <span>{t.settings.syncNowBtn}</span>
            </button>

            {syncMessage && (
              <span className={`text-xs font-medium flex items-center gap-1.5 ${
                syncStatus === "success" ? "text-forest" : syncStatus === "error" ? "text-terra" : "text-inkSoft"
              }`}>
                {syncStatus === "success" && <CheckCircle className="w-3.5 h-3.5" />}
                {syncStatus === "error" && <AlertCircle className="w-3.5 h-3.5" />}
                {syncMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* META AI CREDENTIAL CARD */}
      <div className="garden-card space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-line">
          <Key className="w-4 h-4 text-forest" />
          <h2 className="font-serif text-base font-bold text-forestDark">
            {t.settings.metaConnectionTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {metaApiKey ? (
            <span className="text-forest font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-forest" />
              {t.settings.keyConfiguredLabel}
            </span>
          ) : (
            <span className="text-inkSoft flex items-center gap-1">
              <Lock className="w-4 h-4 text-inkSoft" />
              {t.settings.keyNotConfiguredLabel}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-forestDark">
            {t.settings.metaKeyLabel}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste META_API_KEY here..."
              className="flex-1 px-3 py-2 rounded-lg border border-line text-xs font-mono"
            />
            <button
              onClick={handleSaveApiKey}
              disabled={!inputKey.trim()}
              className="btn-primary text-xs"
            >
              {t.settings.saveKeyBtn}
            </button>
            {metaApiKey && (
              <button
                onClick={handleDeleteApiKey}
                className="btn-ghost text-xs text-terra hover:border-terra"
              >
                {t.settings.deleteKeyBtn}
              </button>
            )}
          </div>
          {keyNotice && (
            <p className="text-xs text-forest font-medium">{keyNotice}</p>
          )}
        </div>
      </div>

      {/* BACKUP & RESTORE CARD */}
      <div className="garden-card space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-line">
          <Database className="w-4 h-4 text-forest" />
          <h2 className="font-serif text-base font-bold text-forestDark">
            {t.settings.backupCardTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-inkSoft">
          <div className="p-2.5 rounded-lg bg-white border border-line">
            <strong className="block text-forestDark font-serif text-sm font-bold">
              {data.stories.length}
            </strong>
            Stories
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-line">
            <strong className="block text-forestDark font-serif text-sm font-bold">
              {data.attempts.length}
            </strong>
            Practice Attempts
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-line">
            <strong className="block text-forestDark font-serif text-sm font-bold">
              {data.dialectRules.length}
            </strong>
            Dialect Rules
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-line">
            <strong className="block text-forestDark font-serif text-sm font-bold">
              {data.journalEntries.length}
            </strong>
            Journal Notes
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleBackupFileSelect}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button onClick={exportBackup} className="btn-primary text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>{t.settings.exportBackupBtn}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.settings.importBackupBtn}</span>
          </button>
          <button onClick={resetToSeed} className="btn-ghost text-xs text-terra hover:border-terra">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.settings.resetSeedBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
