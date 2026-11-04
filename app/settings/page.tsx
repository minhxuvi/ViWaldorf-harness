"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { ModelGateway } from "@/lib/ai/modelGateway";
import { AIProvider } from "@/lib/types";
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
  Sparkles,
  Cpu,
} from "lucide-react";

export default function SettingsPage() {
  const {
    data,
    googleApiKey,
    setGoogleApiKey,
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
    t,
  } = useApp();

  const [inputGoogleKey, setInputGoogleKey] = useState("");
  const [inputMetaKey, setInputMetaKey] = useState("");
  const [passkeyInput, setPasskeyInput] = useState(syncPasskey);
  const [googleKeyNotice, setGoogleKeyNotice] = useState("");
  const [metaKeyNotice, setMetaKeyNotice] = useState("");
  const [isTestingGoogleKey, setIsTestingGoogleKey] = useState(false);
  const [googleTestResult, setGoogleTestResult] = useState<{ valid?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveGoogleKey = () => {
    if (!inputGoogleKey.trim()) return;
    setGoogleApiKey(inputGoogleKey.trim());
    setInputGoogleKey("");
    setGoogleKeyNotice(t.settings.googleKeyConfigured);
    setTimeout(() => setGoogleKeyNotice(""), 3000);
  };

  const handleDeleteGoogleKey = () => {
    setGoogleApiKey("");
    setGoogleTestResult(null);
    setGoogleKeyNotice("Google API Key removed.");
    setTimeout(() => setGoogleKeyNotice(""), 3000);
  };

  const handleTestGoogleKey = async () => {
    const keyToTest = inputGoogleKey.trim() || googleApiKey;
    if (!keyToTest) return;
    setIsTestingGoogleKey(true);
    setGoogleTestResult(null);
    const res = await ModelGateway.testGoogleApiKey(keyToTest);
    setIsTestingGoogleKey(false);
    setGoogleTestResult(res);
  };

  const handleSaveMetaKey = () => {
    if (!inputMetaKey.trim()) return;
    setMetaApiKey(inputMetaKey.trim());
    setInputMetaKey("");
    setMetaKeyNotice("Meta API Key saved securely in browser storage.");
    setTimeout(() => setMetaKeyNotice(""), 3000);
  };

  const handleDeleteMetaKey = () => {
    setMetaApiKey("");
    setMetaKeyNotice("Meta API Key removed.");
    setTimeout(() => setMetaKeyNotice(""), 3000);
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

      {/* AI PROVIDER SELECTOR */}
      <div className="garden-card space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-line">
          <Cpu className="w-5 h-5 text-forest" />
          <h2 className="font-serif text-base font-bold text-forestDark">
            {t.settings.providerSelectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setAiProvider("google")}
            className={`p-3.5 rounded-xl border text-left transition space-y-1 ${
              aiProvider === "google"
                ? "border-forest bg-[#E3EFE0]/60 ring-2 ring-forest"
                : "border-line bg-white hover:border-forest/40"
            }`}
          >
            <div className="font-serif font-bold text-xs text-forestDark flex items-center justify-between">
              <span>{t.settings.providerGoogle}</span>
              {aiProvider === "google" && <CheckCircle className="w-3.5 h-3.5 text-forest" />}
            </div>
            <p className="text-[11px] text-inkSoft leading-tight">
              Imagen 3 (Visual Art) + Gemini 2.0 Flash (Pedagogy). Low latency, high quota.
            </p>
          </button>

          <button
            onClick={() => setAiProvider("meta")}
            className={`p-3.5 rounded-xl border text-left transition space-y-1 ${
              aiProvider === "meta"
                ? "border-terra bg-[#F7ECD8]/60 ring-2 ring-terra"
                : "border-line bg-white hover:border-terra/40"
            }`}
          >
            <div className="font-serif font-bold text-xs text-forestDark flex items-center justify-between">
              <span>{t.settings.providerMeta}</span>
              {aiProvider === "meta" && <CheckCircle className="w-3.5 h-3.5 text-terra" />}
            </div>
            <p className="text-[11px] text-inkSoft leading-tight">
              muse-wonder-1.0 + muse-image-1.0 + muse-voice-transcribe.
            </p>
          </button>

          <button
            onClick={() => setAiProvider("local")}
            className={`p-3.5 rounded-xl border text-left transition space-y-1 ${
              aiProvider === "local"
                ? "border-forest bg-[#E3EFE0]/60 ring-2 ring-forest"
                : "border-line bg-white hover:border-forest/40"
            }`}
          >
            <div className="font-serif font-bold text-xs text-forestDark flex items-center justify-between">
              <span>{t.settings.providerLocal}</span>
              {aiProvider === "local" && <CheckCircle className="w-3.5 h-3.5 text-forest" />}
            </div>
            <p className="text-[11px] text-inkSoft leading-tight">
              100% Client-side Goethean SVG watercolor/crayon algorithms & Web Audio API. Zero network calls.
            </p>
          </button>
        </div>
      </div>

      {/* GOOGLE AI CREDENTIAL CARD */}
      <div className="garden-card space-y-4 border-2 border-forest/30 bg-[#FDFBF7]">
        <div className="flex items-center justify-between pb-2.5 border-b border-line">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest" />
            <h2 className="font-serif text-base font-bold text-forestDark">
              {t.settings.googleConnectionTitle}
            </h2>
          </div>
          {aiProvider === "google" && (
            <span className="badge-leaf text-xs">Active Provider</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {googleApiKey ? (
            <span className="text-forest font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-forest" />
              {t.settings.googleKeyConfigured}
            </span>
          ) : (
            <span className="text-inkSoft flex items-center gap-1">
              <Lock className="w-4 h-4 text-inkSoft" />
              {t.settings.googleKeyNotConfigured}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-forestDark">
            {t.settings.googleKeyLabel}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={inputGoogleKey}
              onChange={(e) => setInputGoogleKey(e.target.value)}
              placeholder={googleApiKey ? "••••••••••••••••••••••••••••••••" : "Paste AIzaSy... key from Google AI Studio"}
              className="flex-1 px-3 py-2 rounded-lg border border-line text-xs font-mono bg-white"
            />
            <button
              onClick={handleSaveGoogleKey}
              disabled={!inputGoogleKey.trim()}
              className="btn-primary text-xs"
            >
              {t.settings.saveKeyBtn}
            </button>
            <button
              onClick={handleTestGoogleKey}
              disabled={isTestingGoogleKey || (!inputGoogleKey.trim() && !googleApiKey)}
              className="btn-ghost text-xs whitespace-nowrap"
            >
              {isTestingGoogleKey ? t.settings.testingConnection : t.settings.testConnectionBtn}
            </button>
            {googleApiKey && (
              <button
                onClick={handleDeleteGoogleKey}
                className="btn-ghost text-xs text-terra hover:border-terra"
              >
                {t.settings.deleteKeyBtn}
              </button>
            )}
          </div>

          {googleKeyNotice && (
            <p className="text-xs text-forest font-medium">{googleKeyNotice}</p>
          )}

          {googleTestResult && (
            <div
              className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                googleTestResult.valid
                  ? "bg-[#E3EFE0] text-forest border border-[#BEDEBA]"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {googleTestResult.valid ? (
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>{googleTestResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* META AI CREDENTIAL CARD */}
      <div className="garden-card space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-line">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-terra" />
            <h2 className="font-serif text-base font-bold text-forestDark">
              {t.settings.metaConnectionTitle}
            </h2>
          </div>
          {aiProvider === "meta" && (
            <span className="badge-terra text-xs">Active Provider</span>
          )}
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
              value={inputMetaKey}
              onChange={(e) => setInputMetaKey(e.target.value)}
              placeholder={metaApiKey ? "••••••••••••••••••••••••••••••••" : "Paste META_API_KEY here..."}
              className="flex-1 px-3 py-2 rounded-lg border border-line text-xs font-mono bg-white"
            />
            <button
              onClick={handleSaveMetaKey}
              disabled={!inputMetaKey.trim()}
              className="btn-primary text-xs"
            >
              {t.settings.saveKeyBtn}
            </button>
            {metaApiKey && (
              <button
                onClick={handleDeleteMetaKey}
                className="btn-ghost text-xs text-terra hover:border-terra"
              >
                {t.settings.deleteKeyBtn}
              </button>
            )}
          </div>
          {metaKeyNotice && (
            <p className="text-xs text-forest font-medium">{metaKeyNotice}</p>
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
