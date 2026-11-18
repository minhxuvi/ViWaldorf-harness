"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { AuthUser, ReadingProgress } from "@/lib/types";
import { Lock, Mail, User, X, CheckCircle2 } from "lucide-react";

type AuthMode = "login" | "register";

export function AuthModal() {
  const {
    t,
    isAuthModalOpen,
    setIsAuthModalOpen,
    googleOAuthConfigured,
    authNotice,
    setAuthNotice,
    setAuthSession,
    readingProgress,
  } = useApp();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAuthModalOpen(false);
        setAuthNotice("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAuthModalOpen, setIsAuthModalOpen, setAuthNotice]);

  if (!isAuthModalOpen) return null;

  const closeModal = () => {
    setIsAuthModalOpen(false);
    setAuthNotice("");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg("");
    setAuthNotice("");
    setIsSubmitting(true);

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? { name, email, password, readingProgress }
          : { email, password, readingProgress };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        user?: AuthUser;
        readingProgress?: ReadingProgress | null;
        error?: string;
      };

      if (!res.ok || !data.user) {
        setErrorMsg(data.error || t.auth.genericError);
        return;
      }

      setAuthSession(data.user, data.readingProgress ?? null);
      setPassword("");
      closeModal();
    } catch {
      setErrorMsg(t.auth.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = errorMsg || authNotice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="w-full max-w-md garden-card bg-card shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeModal}
          aria-label={t.auth.closeBtn}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-inkSoft hover:text-forestDark hover:bg-[#FAF3E3] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pr-8">
          <h2 id="auth-modal-title" className="font-serif text-xl font-bold text-forestDark">
            {mode === "login" ? t.auth.modalTitleLogin : t.auth.modalTitleRegister}
          </h2>
          <p className="text-xs text-inkSoft leading-relaxed">{t.auth.modalSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 rounded-xl bg-[#F7ECD8]/70 p-1 border border-line">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              mode === "login"
                ? "bg-forest text-white shadow-sm"
                : "text-forestDark hover:bg-white/60"
            }`}
          >
            {t.auth.loginTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              mode === "register"
                ? "bg-forest text-white shadow-sm"
                : "text-forestDark hover:bg-white/60"
            }`}
          >
            {t.auth.registerTab}
          </button>
        </div>

        {displayedError && (
          <div
            role="alert"
            className="text-xs text-terra bg-[#FDF2F0] border border-terra/30 rounded-xl px-3 py-2"
          >
            {displayedError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-forestDark flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-forest" />
                {t.auth.nameLabel}
              </span>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.namePlaceholder}
                className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-ink"
              />
            </label>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-forestDark flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-forest" />
              {t.auth.emailLabel}
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-ink"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-forestDark flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-forest" />
              {t.auth.passwordLabel}
            </span>
            <input
              type="password"
              required
              minLength={mode === "register" ? 8 : 1}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? t.auth.passwordHint : ""}
              className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-ink"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5 text-sm"
          >
            {isSubmitting
              ? t.auth.submittingBtn
              : mode === "login"
              ? t.auth.loginSubmitBtn
              : t.auth.registerSubmitBtn}
          </button>
        </form>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-line" />
            <span className="text-[11px] uppercase tracking-wider text-inkSoft font-medium">
              {t.auth.orDivider}
            </span>
            <div className="flex-1 border-t border-line" />
          </div>

          {googleOAuthConfigured ? (
            <a
              href="/api/auth/google/redirect"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-forestDark shadow-xs hover:bg-[#FAF3E3] transition"
            >
              <GoogleMark />
              <span>
                {mode === "login" ? t.auth.googleSignInBtn : t.auth.googleRegisterBtn}
              </span>
            </a>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-[#FAF4E8]/70 px-3 py-2.5 text-center space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-inkSoft">
                <GoogleMark />
                <span>{t.auth.googleSignInBtn}</span>
              </div>
              <p className="text-[11px] text-inkSoft leading-snug">
                {t.auth.googleUnavailableHint}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-[#E3EFE0]/60 border border-forest/20 px-3 py-2 text-[11px] text-forestDark">
          <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0 mt-0.5" />
          <span>{t.auth.syncNote}</span>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
