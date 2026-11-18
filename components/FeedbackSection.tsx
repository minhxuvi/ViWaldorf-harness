"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import {
  FeedbackDevelopmentStatus,
  FeedbackStatus,
  FeedbackThreadItem,
} from "@/lib/types";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";

const STATUS_FILTERS: readonly ("all" | FeedbackStatus)[] = [
  "all",
  "open",
  "in_progress",
  "answered",
  "closed",
] as const;

function formatDateTime(iso: string, lang: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  try {
    return new Date(ts).toLocaleString(lang === "en" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatShortDate(iso: string, lang: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  try {
    return new Date(ts).toLocaleDateString(lang === "en" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getStatusBadgeClass(status: FeedbackStatus): string {
  switch (status) {
    case "open":
      return "badge-leaf";
    case "in_progress":
      return "badge-sand";
    case "answered":
      return "badge-terra";
    case "closed":
      return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFE9DC] text-inkSoft";
  }
}

export function FeedbackSection({
  currentChapterLabel,
  onBackToStory,
}: {
  currentChapterLabel?: string;
  onBackToStory: () => void;
}) {
  const { t, lang, user, setIsAuthModalOpen } = useApp();

  const [threads, setThreads] = useState<FeedbackThreadItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | FeedbackStatus>("all");
  const [selectedThread, setSelectedThread] = useState<FeedbackThreadItem | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [attachChapter, setAttachChapter] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [replyBody, setReplyBody] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchThreads = useCallback(
    async (filter: "all" | FeedbackStatus) => {
      setIsLoadingList(true);
      setErrorMsg("");
      try {
        const query = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
        const res = await fetch(`/api/feedback${query}`, { cache: "no-store" });
        if (!res.ok) throw new Error(t.feedback.loadError);
        const json = (await res.json()) as { data?: FeedbackThreadItem[] };
        setThreads(Array.isArray(json.data) ? json.data : []);
      } catch {
        setErrorMsg(t.feedback.loadError);
      } finally {
        setIsLoadingList(false);
      }
    },
    [t.feedback.loadError]
  );

  useEffect(() => {
    void fetchThreads(statusFilter);
  }, [fetchThreads, statusFilter]);

  const openThreadDetail = async (threadId: number) => {
    setIsLoadingDetail(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/feedback/${threadId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(t.feedback.loadError);
      const json = (await res.json()) as { data?: FeedbackThreadItem };
      if (json.data) {
        setSelectedThread(json.data);
      }
    } catch {
      setErrorMsg(t.feedback.loadError);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsCreating(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          body: newBody,
          chapterRef: attachChapter && currentChapterLabel ? currentChapterLabel : null,
        }),
      });
      const json = (await res.json()) as { data?: FeedbackThreadItem; error?: string };
      if (!res.ok || !json.data) {
        setErrorMsg(json.error || t.feedback.loadError);
        return;
      }
      setNewTitle("");
      setNewBody("");
      setSuccessMsg(t.feedback.createdSuccess);
      setSelectedThread(json.data);
      void fetchThreads(statusFilter);
    } catch {
      setErrorMsg(t.feedback.loadError);
    } finally {
      setIsCreating(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || isReplying) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsReplying(true);
    try {
      const res = await fetch(`/api/feedback/${selectedThread.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      const json = (await res.json()) as { data?: FeedbackThreadItem; error?: string };
      if (!res.ok || !json.data) {
        setErrorMsg(json.error || t.feedback.loadError);
        return;
      }
      setReplyBody("");
      setSelectedThread(json.data);
      setSuccessMsg(t.feedback.repliedSuccess);
      void fetchThreads(statusFilter);
    } catch {
      setErrorMsg(t.feedback.loadError);
    } finally {
      setIsReplying(false);
    }
  };

  const handleCloseThread = async () => {
    if (!selectedThread || isClosing) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsClosing(true);
    try {
      const res = await fetch(`/api/feedback/${selectedThread.id}/close`, {
        method: "POST",
      });
      const json = (await res.json()) as { data?: FeedbackThreadItem; error?: string };
      if (!res.ok || !json.data) {
        setErrorMsg(json.error || t.feedback.loadError);
        return;
      }
      setSelectedThread(json.data);
      setSuccessMsg(t.feedback.closedSuccess);
      void fetchThreads(statusFilter);
    } catch {
      setErrorMsg(t.feedback.loadError);
    } finally {
      setIsClosing(false);
    }
  };

  const getStatusLabel = (status: FeedbackStatus) => t.feedback.statuses[status];
  const getDevStatusLabel = (status: FeedbackDevelopmentStatus) =>
    t.feedback.developmentStatuses[status];

  return (
    <div className="space-y-6 pb-16">
      <div className="garden-card bg-[#FCF9F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-forest" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-forestDark">
              {t.feedback.pageTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-inkSoft">{t.feedback.pageSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={onBackToStory}
          className="btn-ghost text-xs py-2 px-3 self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.feedback.backToStoryBtn}</span>
        </button>
      </div>

      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-[#E3EFE0] border border-forest/30 px-4 py-3 text-sm text-forestDark font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl bg-[#FDF2F0] border border-terra/30 px-4 py-3 text-sm text-terra font-medium"
        >
          {errorMsg}
        </div>
      )}

      {selectedThread ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedThread(null);
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              {t.feedback.backToAllBtn}
            </button>

            <span className={getStatusBadgeClass(selectedThread.status)}>
              {getStatusLabel(selectedThread.status)}
            </span>
          </div>

          {isLoadingDetail ? (
            <div className="garden-card text-sm text-inkSoft">...</div>
          ) : (
            <>
              <article className="garden-card space-y-3">
                <div className="space-y-1">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-forestDark">
                    {selectedThread.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-inkSoft">
                    <span className="font-semibold text-forestDark">
                      {selectedThread.user.name}
                    </span>
                    <span>· {formatDateTime(selectedThread.createdAt, lang)}</span>
                    {selectedThread.chapterRef && (
                      <span className="badge-sand text-[11px]">
                        {t.feedback.chapterRefPrefix}: {selectedThread.chapterRef}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm sm:text-base text-ink whitespace-pre-line break-words leading-relaxed">
                  {selectedThread.body}
                </p>
              </article>

              {(selectedThread.development.status !== "none" ||
                selectedThread.development.openspecChange ||
                selectedThread.development.githubIssueUrl ||
                selectedThread.development.githubPrUrl ||
                selectedThread.development.implementedAt ||
                selectedThread.development.deployedAt) && (
                <section className="garden-card bg-[#FDFBF5] border-forest/20 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-base font-bold text-forestDark">
                      {t.feedback.developmentTitle}
                    </h3>
                    <span className="badge-sand text-xs font-semibold">
                      {getDevStatusLabel(selectedThread.development.status)}
                    </span>
                  </div>
                  <ul className="text-xs sm:text-sm text-inkSoft space-y-1">
                    {selectedThread.development.openspecChange && (
                      <li>
                        {t.feedback.specChangeLabel}:{" "}
                        <code className="px-1.5 py-0.5 rounded bg-[#F7ECD8] text-forestDark">
                          {selectedThread.development.openspecChange}
                        </code>
                      </li>
                    )}
                    {selectedThread.development.githubIssueUrl && (
                      <li>
                        {t.feedback.issueLinkLabel}:{" "}
                        <a
                          href={selectedThread.development.githubIssueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest font-semibold inline-flex items-center gap-1 hover:underline break-all"
                        >
                          <span>{selectedThread.development.githubIssueUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                    )}
                    {selectedThread.development.githubPrUrl && (
                      <li>
                        {t.feedback.prLinkLabel}:{" "}
                        <a
                          href={selectedThread.development.githubPrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest font-semibold inline-flex items-center gap-1 hover:underline break-all"
                        >
                          <span>{selectedThread.development.githubPrUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                    )}
                    {selectedThread.development.implementedAt && (
                      <li>
                        {t.feedback.implementedLabel}:{" "}
                        {formatShortDate(selectedThread.development.implementedAt, lang)}
                      </li>
                    )}
                    {selectedThread.development.deployedAt && (
                      <li>
                        {t.feedback.deployedLabel}:{" "}
                        {formatShortDate(selectedThread.development.deployedAt, lang)}
                      </li>
                    )}
                  </ul>
                </section>
              )}

              <div className="space-y-3">
                {(selectedThread.messages || []).map((msg) => (
                  <article
                    key={msg.id}
                    className={`garden-card space-y-2 ${
                      msg.user.isEditorial
                        ? "bg-[#E3EFE0]/55 border-[#C5DEC0]"
                        : "bg-card border-line"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-forestDark">{msg.user.name}</span>
                      {msg.user.isEditorial && (
                        <span className="badge-leaf text-[11px] font-semibold">
                          {t.feedback.editorialBadge}
                        </span>
                      )}
                      <span className="text-inkSoft">
                        · {formatDateTime(msg.createdAt, lang)}
                      </span>
                    </div>
                    <p className="text-sm text-ink whitespace-pre-line break-words leading-relaxed">
                      {msg.body}
                    </p>
                  </article>
                ))}
              </div>

              {selectedThread.status === "closed" ? (
                <div className="garden-card text-sm text-inkSoft italic">
                  {t.feedback.closedNotice}
                </div>
              ) : (
                <div className="space-y-3">
                  {user ? (
                    <form onSubmit={handleReply} className="garden-card space-y-3">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-semibold text-forestDark">
                          {t.feedback.replyLabel}
                        </span>
                        <textarea
                          required
                          maxLength={5000}
                          rows={3}
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          placeholder={t.feedback.replyPlaceholder}
                          className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-ink"
                        />
                      </label>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="submit"
                          disabled={isReplying}
                          className="btn-primary text-xs py-2 px-4"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {isReplying ? t.feedback.submittingBtn : t.feedback.replySubmitBtn}
                          </span>
                        </button>

                        {selectedThread.user.id === user.id && (
                          <button
                            type="button"
                            onClick={handleCloseThread}
                            disabled={isClosing}
                            className="btn-ghost text-xs py-2 px-3 border-terra/35 text-terra"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t.feedback.closeThreadBtn}</span>
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="garden-card flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-inkSoft">{t.feedback.loginPrompt}</p>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="btn-primary text-xs py-2 px-3.5"
                      >
                        {t.feedback.loginBtn}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-ink leading-relaxed">{t.feedback.description}</p>

          {user ? (
            <form onSubmit={handleCreateThread} className="garden-card space-y-3.5">
              <h2 className="font-serif text-lg font-bold text-forestDark">
                {t.feedback.newThreadTitle}
              </h2>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-forestDark">
                  {t.feedback.titleLabel}
                </span>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t.feedback.titlePlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-ink"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-forestDark">
                  {t.feedback.bodyLabel}
                </span>
                <textarea
                  required
                  maxLength={5000}
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder={t.feedback.bodyPlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-white text-sm text-ink"
                />
              </label>

              {currentChapterLabel && (
                <label className="flex items-center gap-2 text-xs text-inkSoft cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={attachChapter}
                    onChange={(e) => setAttachChapter(e.target.checked)}
                    className="rounded border-line text-forest"
                  />
                  <span>
                    {t.feedback.attachCurrentChapterLabel}:{" "}
                    <strong className="text-forestDark">{currentChapterLabel}</strong>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary text-xs sm:text-sm py-2 px-4"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isCreating ? t.feedback.submittingBtn : t.feedback.submitThreadBtn}
                </span>
              </button>
            </form>
          ) : (
            <div className="garden-card flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-inkSoft">{t.feedback.loginPrompt}</p>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary text-xs py-2 px-3.5"
              >
                {t.feedback.loginBtn}
              </button>
            </div>
          )}

          <nav
            className="flex flex-wrap gap-2"
            aria-label={t.feedback.pageTitle}
          >
            {STATUS_FILTERS.map((st) => {
              const active = statusFilter === st;
              const label =
                st === "all" ? t.feedback.filterAll : getStatusLabel(st);
              return (
                <button
                  key={st}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    active
                      ? "bg-terra text-white border-transparent shadow-xs"
                      : "bg-white text-forestDark border-line hover:bg-[#FAF3E3]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {isLoadingList ? (
            <div className="garden-card text-sm text-inkSoft">...</div>
          ) : threads.length === 0 ? (
            <div className="garden-card text-sm text-inkSoft space-y-2">
              {statusFilter === "all" ? (
                <p>{t.feedback.emptyList}</p>
              ) : (
                <p>
                  {t.feedback.emptyFilteredPrefix}{" "}
                  <strong>{getStatusLabel(statusFilter)}</strong>.{" "}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className="underline font-semibold text-forest"
                  >
                    {t.feedback.showAllBtn}
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => void openThreadDetail(thread.id)}
                  className="w-full text-left garden-card hover:border-forest/45 transition space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-forestDark">
                      {thread.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {thread.development.status !== "none" && (
                        <span className="badge-sand text-[11px] font-semibold">
                          {getDevStatusLabel(thread.development.status)}
                        </span>
                      )}
                      <span className={getStatusBadgeClass(thread.status)}>
                        {getStatusLabel(thread.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-ink line-clamp-2">{thread.body}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-inkSoft">
                    <span className="font-medium text-forestDark">{thread.user.name}</span>
                    <span>· {formatDateTime(thread.createdAt, lang)}</span>
                    {typeof thread.messagesCount === "number" && thread.messagesCount > 0 && (
                      <span>
                        · {thread.messagesCount} {t.feedback.repliesCountSuffix}
                      </span>
                    )}
                    {thread.chapterRef && (
                      <span className="badge-sand text-[10px] py-0 px-2">
                        {thread.chapterRef}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
