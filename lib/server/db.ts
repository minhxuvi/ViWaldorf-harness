import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { sanitizeReadingProgress } from "../readingProgress";
import {
  AuthUser,
  FeedbackDevelopmentStatus,
  FeedbackMessageItem,
  FeedbackStatus,
  FeedbackThreadItem,
  ReadingProgress,
} from "../types";

export const FEEDBACK_STATUSES: readonly FeedbackStatus[] = [
  "open",
  "in_progress",
  "answered",
  "closed",
] as const;

export const FEEDBACK_DEVELOPMENT_STATUSES: readonly FeedbackDevelopmentStatus[] = [
  "none",
  "considering",
  "planned",
  "in_progress",
  "implemented",
  "declined",
] as const;

export interface DbUserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  role: "member" | "editorial";
  created_at: string;
  updated_at: string;
}

interface RawThreadRow {
  id: number;
  user_id: number;
  title: string;
  body: string;
  chapter_ref: string | null;
  status: string;
  development_status: string;
  openspec_change: string | null;
  github_issue_url: string | null;
  github_pr_url: string | null;
  implemented_at: string | null;
  deployed_at: string | null;
  created_at: string;
  updated_at: string;
  author_name: string;
  messages_count: number;
}

interface RawMessageRow {
  id: number;
  feedback_thread_id: number;
  user_id: number;
  body: string;
  created_at: string;
  author_name: string;
  author_role: string;
}

let cachedDb: DatabaseSync | null = null;
let cachedDbPath: string | null = null;

function resolveDbPath(overridePath?: string): string {
  if (overridePath) return overridePath;
  if (process.env.VIWALDORF_DB_PATH && process.env.VIWALDORF_DB_PATH.trim()) {
    return process.env.VIWALDORF_DB_PATH.trim();
  }
  return path.join(process.cwd(), "data", "viwaldorf.sqlite");
}

function getEditorialEmail(): string {
  return (process.env.FEEDBACK_EDITORIAL_EMAIL || "banbientap@viwaldorf.vn")
    .trim()
    .toLowerCase();
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS reading_progress (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      progress_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      chapter_ref TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      development_status TEXT NOT NULL DEFAULT 'none',
      openspec_change TEXT,
      github_issue_url TEXT,
      github_pr_url TEXT,
      implemented_at TEXT,
      deployed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_threads_status ON feedback_threads(status);
    CREATE INDEX IF NOT EXISTS idx_feedback_threads_dev_status ON feedback_threads(development_status);

    CREATE TABLE IF NOT EXISTS feedback_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feedback_thread_id INTEGER NOT NULL REFERENCES feedback_threads(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_messages_thread_id ON feedback_messages(feedback_thread_id);
  `);

  const now = new Date().toISOString();
  const editorialEmail = getEditorialEmail();
  db.prepare(
    `INSERT OR IGNORE INTO users (name, email, password_hash, google_id, role, created_at, updated_at)
     VALUES (?, ?, NULL, NULL, 'editorial', ?, ?)`
  ).run("Ban biên tập ViWaldorf", editorialEmail, now, now);
}

export function getDb(): DatabaseSync {
  const targetPath = resolveDbPath();
  if (cachedDb && cachedDbPath === targetPath) {
    return cachedDb;
  }
  if (cachedDb) {
    try {
      cachedDb.close();
    } catch {
      // Ignore close error
    }
    cachedDb = null;
  }

  if (targetPath !== ":memory:") {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }

  const db = new DatabaseSync(targetPath);
  if (targetPath !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL;");
  }
  initSchema(db);
  cachedDb = db;
  cachedDbPath = targetPath;
  return db;
}

export function resetDbForTests(customPath?: string): void {
  if (cachedDb) {
    try {
      cachedDb.close();
    } catch {
      // Ignore close error
    }
    cachedDb = null;
    cachedDbPath = null;
  }
  if (customPath) {
    process.env.VIWALDORF_DB_PATH = customPath;
  }
}

export function toPublicAuthUser(row: DbUserRow): AuthUser {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    googleConnected: Boolean(row.google_id),
    createdAt: row.created_at,
  };
}

export function getEditorialUser(): DbUserRow {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE role = 'editorial' ORDER BY id ASC LIMIT 1")
    .get() as DbUserRow | undefined;
  if (row) return row;

  const now = new Date().toISOString();
  const editorialEmail = getEditorialEmail();
  const res = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, google_id, role, created_at, updated_at)
       VALUES (?, ?, NULL, NULL, 'editorial', ?, ?)`
    )
    .run("Ban biên tập ViWaldorf", editorialEmail, now, now);

  return db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(Number(res.lastInsertRowid)) as unknown as DbUserRow;
}

export function getUserReadingProgress(userId: number): ReadingProgress | null {
  const db = getDb();
  const row = db
    .prepare("SELECT progress_json FROM reading_progress WHERE user_id = ?")
    .get(userId) as { progress_json: string } | undefined;
  if (!row) return null;
  try {
    return sanitizeReadingProgress(JSON.parse(row.progress_json));
  } catch {
    return null;
  }
}

export function saveUserReadingProgress(userId: number, rawProgress: unknown): ReadingProgress | null {
  const sanitized = sanitizeReadingProgress(rawProgress);
  if (!sanitized) return null;

  const existing = getUserReadingProgress(userId);
  if (existing && Date.parse(existing.updatedAt) > Date.parse(sanitized.updatedAt)) {
    return existing;
  }

  const db = getDb();
  db.prepare(
    `INSERT INTO reading_progress (user_id, progress_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       progress_json = excluded.progress_json,
       updated_at = excluded.updated_at`
  ).run(userId, JSON.stringify(sanitized), sanitized.updatedAt);

  return sanitized;
}

function mapMessageRow(row: RawMessageRow): FeedbackMessageItem {
  return {
    id: Number(row.id),
    threadId: Number(row.feedback_thread_id),
    body: row.body,
    createdAt: row.created_at,
    user: {
      id: Number(row.user_id),
      name: row.author_name,
      isEditorial: row.author_role === "editorial",
    },
  };
}

function mapThreadRow(
  row: RawThreadRow,
  messages?: FeedbackMessageItem[]
): FeedbackThreadItem {
  const status = FEEDBACK_STATUSES.includes(row.status as FeedbackStatus)
    ? (row.status as FeedbackStatus)
    : "open";
  const devStatus = FEEDBACK_DEVELOPMENT_STATUSES.includes(
    row.development_status as FeedbackDevelopmentStatus
  )
    ? (row.development_status as FeedbackDevelopmentStatus)
    : "none";

  return {
    id: Number(row.id),
    title: row.title,
    body: row.body,
    chapterRef: row.chapter_ref,
    status,
    development: {
      status: devStatus,
      openspecChange: row.openspec_change,
      githubIssueUrl: row.github_issue_url,
      githubPrUrl: row.github_pr_url,
      implementedAt: row.implemented_at,
      deployedAt: row.deployed_at,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: {
      id: Number(row.user_id),
      name: row.author_name,
    },
    messagesCount: Number(row.messages_count ?? messages?.length ?? 0),
    messages,
  };
}

export function listFeedbackThreads(options?: {
  status?: string | null;
  includeMessages?: boolean;
}): FeedbackThreadItem[] {
  const db = getDb();
  const statusFilter =
    options?.status && FEEDBACK_STATUSES.includes(options.status as FeedbackStatus)
      ? options.status
      : null;

  const sql = `
    SELECT
      ft.*,
      u.name AS author_name,
      (SELECT COUNT(*) FROM feedback_messages fm WHERE fm.feedback_thread_id = ft.id) AS messages_count
    FROM feedback_threads ft
    JOIN users u ON u.id = ft.user_id
    ${statusFilter ? "WHERE ft.status = ?" : ""}
    ORDER BY ft.updated_at DESC, ft.id DESC
    LIMIT 100
  `;

  const rows = (statusFilter
    ? db.prepare(sql).all(statusFilter)
    : db.prepare(sql).all()) as unknown as RawThreadRow[];

  if (!options?.includeMessages || rows.length === 0) {
    return rows.map((row) => mapThreadRow(row));
  }

  const threadIds = rows.map((r) => Number(r.id));
  const placeholders = threadIds.map(() => "?").join(", ");
  const msgRows = db
    .prepare(
      `SELECT fm.*, u.name AS author_name, u.role AS author_role
       FROM feedback_messages fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.feedback_thread_id IN (${placeholders})
       ORDER BY fm.id ASC`
    )
    .all(...threadIds) as unknown as RawMessageRow[];

  const byThread = new Map<number, FeedbackMessageItem[]>();
  for (const m of msgRows) {
    const tid = Number(m.feedback_thread_id);
    const list = byThread.get(tid) || [];
    list.push(mapMessageRow(m));
    byThread.set(tid, list);
  }

  return rows.map((row) => mapThreadRow(row, byThread.get(Number(row.id)) || []));
}

export function getFeedbackThreadById(threadId: number): FeedbackThreadItem | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
         ft.*,
         u.name AS author_name,
         (SELECT COUNT(*) FROM feedback_messages fm WHERE fm.feedback_thread_id = ft.id) AS messages_count
       FROM feedback_threads ft
       JOIN users u ON u.id = ft.user_id
       WHERE ft.id = ?`
    )
    .get(threadId) as RawThreadRow | undefined;

  if (!row) return null;

  const msgRows = db
    .prepare(
      `SELECT fm.*, u.name AS author_name, u.role AS author_role
       FROM feedback_messages fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.feedback_thread_id = ?
       ORDER BY fm.id ASC`
    )
    .all(threadId) as unknown as RawMessageRow[];

  return mapThreadRow(row, msgRows.map(mapMessageRow));
}

export function createFeedbackThread(params: {
  userId: number;
  title: string;
  body: string;
  chapterRef?: string | null;
}): FeedbackThreadItem {
  const db = getDb();
  const now = new Date().toISOString();
  const chapterRef =
    params.chapterRef && params.chapterRef.trim() ? params.chapterRef.trim().slice(0, 160) : null;

  const result = db
    .prepare(
      `INSERT INTO feedback_threads (user_id, title, body, chapter_ref, status, development_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'open', 'none', ?, ?)`
    )
    .run(params.userId, params.title.trim(), params.body.trim(), chapterRef, now, now);

  const created = getFeedbackThreadById(Number(result.lastInsertRowid));
  if (!created) {
    throw new Error("Could not load newly created feedback thread.");
  }
  return created;
}

export function createFeedbackReply(params: {
  threadId: number;
  userId: number;
  body: string;
  isEditorialResponse?: boolean;
}): { thread: FeedbackThreadItem; message: FeedbackMessageItem } {
  const db = getDb();
  const existing = getFeedbackThreadById(params.threadId);
  if (!existing) {
    throw new FeedbackActionError("Feedback thread not found.", 404);
  }
  if (existing.status === "closed") {
    throw new FeedbackActionError("This feedback thread has been closed.", 422);
  }

  const now = new Date().toISOString();
  const insertRes = db
    .prepare(
      `INSERT INTO feedback_messages (feedback_thread_id, user_id, body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(params.threadId, params.userId, params.body.trim(), now, now);

  const nextStatus: FeedbackStatus =
    params.isEditorialResponse && existing.status === "open" ? "answered" : existing.status;

  db.prepare(`UPDATE feedback_threads SET status = ?, updated_at = ? WHERE id = ?`).run(
    nextStatus,
    now,
    params.threadId
  );

  const updated = getFeedbackThreadById(params.threadId);
  const message = updated?.messages?.find((m) => m.id === Number(insertRes.lastInsertRowid));
  if (!updated || !message) {
    throw new Error("Failed to read saved feedback reply.");
  }
  return { thread: updated, message };
}

export function closeFeedbackThread(params: {
  threadId: number;
  userId: number;
}): FeedbackThreadItem {
  const db = getDb();
  const existing = getFeedbackThreadById(params.threadId);
  if (!existing) {
    throw new FeedbackActionError("Feedback thread not found.", 404);
  }
  if (existing.user.id !== params.userId) {
    throw new FeedbackActionError("Only the thread author can close this feedback.", 403);
  }
  if (existing.status === "closed") {
    throw new FeedbackActionError("This feedback thread is already closed.", 422);
  }

  const now = new Date().toISOString();
  db.prepare(`UPDATE feedback_threads SET status = 'closed', updated_at = ? WHERE id = ?`).run(
    now,
    params.threadId
  );

  const updated = getFeedbackThreadById(params.threadId);
  if (!updated) {
    throw new Error("Failed to reload closed thread.");
  }
  return updated;
}

export interface FeedbackDevelopmentPatch {
  development_status?: FeedbackDevelopmentStatus;
  openspec_change?: string | null;
  github_issue_url?: string | null;
  github_pr_url?: string | null;
  implemented_at?: string | null;
  deployed_at?: string | null;
}

export function updateFeedbackDevelopment(
  threadId: number,
  patch: FeedbackDevelopmentPatch
): FeedbackThreadItem {
  const db = getDb();
  const existing = getFeedbackThreadById(threadId);
  if (!existing) {
    throw new FeedbackActionError("Feedback thread not found.", 404);
  }

  const nextDevStatus = patch.development_status ?? existing.development.status;
  if (!FEEDBACK_DEVELOPMENT_STATUSES.includes(nextDevStatus)) {
    throw new FeedbackActionError("Invalid development_status.", 422);
  }

  if (
    patch.openspec_change !== undefined &&
    patch.openspec_change !== null &&
    !/^[a-z0-9][a-z0-9-]{0,99}$/.test(patch.openspec_change)
  ) {
    throw new FeedbackActionError("Invalid openspec_change slug.", 422);
  }
  if (
    patch.github_issue_url !== undefined &&
    patch.github_issue_url !== null &&
    !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/[0-9]+$/.test(
      patch.github_issue_url
    )
  ) {
    throw new FeedbackActionError("Invalid github_issue_url.", 422);
  }
  if (
    patch.github_pr_url !== undefined &&
    patch.github_pr_url !== null &&
    !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/[0-9]+$/.test(
      patch.github_pr_url
    )
  ) {
    throw new FeedbackActionError("Invalid github_pr_url.", 422);
  }

  let nextImplementedAt =
    patch.implemented_at !== undefined ? patch.implemented_at : existing.development.implementedAt ?? null;
  const nextDeployedAt =
    patch.deployed_at !== undefined ? patch.deployed_at : existing.development.deployedAt ?? null;

  const nowIso = new Date().toISOString();

  if (nextImplementedAt !== null) {
    const ms = Date.parse(nextImplementedAt);
    if (Number.isNaN(ms) || ms > Date.now() + 60_000) {
      throw new FeedbackActionError("Invalid implemented_at timestamp.", 422);
    }
    nextImplementedAt = new Date(ms).toISOString();
  }

  let normalizedDeployedAt: string | null = nextDeployedAt;
  if (normalizedDeployedAt !== null) {
    const ms = Date.parse(normalizedDeployedAt);
    if (Number.isNaN(ms) || ms > Date.now() + 60_000) {
      throw new FeedbackActionError("Invalid deployed_at timestamp.", 422);
    }
    normalizedDeployedAt = new Date(ms).toISOString();
  }

  if (nextDevStatus === "implemented") {
    if (patch.implemented_at === null) {
      throw new FeedbackActionError(
        "The implemented status requires implemented_at; clear the status instead of setting null.",
        422
      );
    }
    if (nextImplementedAt === null) {
      nextImplementedAt = nowIso;
    }
  } else if (nextImplementedAt !== null || normalizedDeployedAt !== null) {
    throw new FeedbackActionError(
      "Leaving the implemented status requires clearing implemented_at and deployed_at in the same update.",
      422
    );
  }

  if (normalizedDeployedAt !== null) {
    if (nextDevStatus !== "implemented" || nextImplementedAt === null) {
      throw new FeedbackActionError("Deployed timestamp requires implemented status and implemented_at.", 422);
    }
    if (Date.parse(normalizedDeployedAt) < Date.parse(nextImplementedAt)) {
      throw new FeedbackActionError("deployed_at cannot be earlier than implemented_at.", 422);
    }
  }

  const nextOpenspecChange =
    patch.openspec_change !== undefined
      ? patch.openspec_change
      : existing.development.openspecChange ?? null;
  const nextIssueUrl =
    patch.github_issue_url !== undefined
      ? patch.github_issue_url
      : existing.development.githubIssueUrl ?? null;
  const nextPrUrl =
    patch.github_pr_url !== undefined
      ? patch.github_pr_url
      : existing.development.githubPrUrl ?? null;

  db.prepare(
    `UPDATE feedback_threads
     SET development_status = ?,
         openspec_change = ?,
         github_issue_url = ?,
         github_pr_url = ?,
         implemented_at = ?,
         deployed_at = ?,
         updated_at = ?
     WHERE id = ?`
  ).run(
    nextDevStatus,
    nextOpenspecChange,
    nextIssueUrl,
    nextPrUrl,
    nextImplementedAt,
    normalizedDeployedAt,
    nowIso,
    threadId
  );

  const updated = getFeedbackThreadById(threadId);
  if (!updated) {
    throw new Error("Failed to reload updated feedback thread.");
  }
  return updated;
}

export class FeedbackActionError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
