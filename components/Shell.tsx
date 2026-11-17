"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { BookOpen, Languages } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useApp();

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="bg-forestDark text-onDark border-b border-[#2D4D36] sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#2F5D3A] border border-[#497B55] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[#F7ECD8]" />
            </div>
            <div className="min-w-0">
              <span className="block font-serif text-lg sm:text-xl font-bold tracking-wide text-paper leading-tight">
                {t.brand}
              </span>
              <p className="text-[11px] sm:text-xs text-onDarkSoft truncate">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setLang(lang === "vi" ? "en" : "vi")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#254A2E] hover:bg-[#2F5D3A] text-xs font-semibold text-onDark transition"
              title={t.header.languageLabel}
            >
              <Languages className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span className="text-[#E9C46A]">{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
