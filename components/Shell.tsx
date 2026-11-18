"use client";

import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { AuthModal } from "@/components/AuthModal";
import { BookOpen, Languages, LogIn, LogOut, MessageSquare, UserCheck } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const {
    lang,
    setLang,
    t,
    user,
    isAuthLoading,
    setIsAuthModalOpen,
    activeView,
    setActiveView,
    logout,
  } = useApp();
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = Math.max(0, window.scrollY);

    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastScrollYRef.current;

      if (currentY <= 36) {
        setIsHeaderHidden(false);
        lastScrollYRef.current = currentY;
      } else if (delta > 8 && currentY > 64) {
        setIsHeaderHidden(true);
        lastScrollYRef.current = currentY;
      } else if (delta < -8) {
        setIsHeaderHidden(false);
        lastScrollYRef.current = currentY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header
        className={`bg-forestDark text-onDark border-b border-[#2D4D36] sticky top-0 z-30 shadow-sm transition-transform duration-300 ease-in-out ${
          isHeaderHidden ? "-translate-y-full pointer-events-none" : "translate-y-0"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveView("story")}
            className="flex items-center gap-3 min-w-0 text-left hover:opacity-90 transition"
          >
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
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              aria-pressed={activeView === "feedback"}
              onClick={() =>
                setActiveView(activeView === "feedback" ? "story" : "feedback")
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === "feedback"
                  ? "bg-[#E9C46A] text-forestDark"
                  : "bg-[#254A2E] hover:bg-[#2F5D3A] text-onDark"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>
                {activeView === "feedback" ? t.header.storyBtn : t.header.feedbackBtn}
              </span>
            </button>

            {!isAuthLoading &&
              (user ? (
                <div className="flex items-center gap-1">
                  <span
                    title={`${user.email} · ${t.header.progressSavedBadge}`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#254A2E] text-xs font-medium text-[#F7ECD8] max-w-[160px]"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#A7D7A9] flex-shrink-0" />
                    <span className="truncate">{user.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    title={t.header.logoutBtn}
                    aria-label={t.header.logoutBtn}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#254A2E] hover:bg-[#2F5D3A] text-xs font-semibold text-onDark transition"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#E9C46A]" />
                    <span className="hidden md:inline">{t.header.logoutBtn}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#254A2E] hover:bg-[#2F5D3A] text-xs font-semibold text-onDark transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#E9C46A]" />
                  <span>{t.header.loginBtn}</span>
                </button>
              ))}

            <button
              type="button"
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

      <AuthModal />
    </div>
  );
}
