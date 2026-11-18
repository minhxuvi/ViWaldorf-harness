import crypto from "node:crypto";
import { cookies } from "next/headers";
import { DbUserRow, getDb } from "./db";

export const SESSION_COOKIE_NAME = "viwaldorf_session";
export const OAUTH_STATE_COOKIE_NAME = "viwaldorf_oauth_state";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string | null): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function registerUser(params: {
  name: string;
  email: string;
  password: string;
}): DbUserRow {
  const name = params.name.trim();
  const email = normalizeEmail(params.email);
  const password = params.password;

  if (!name || name.length < 2 || name.length > 100) {
    throw new AuthError("Vui lòng nhập tên hiển thị (2–100 ký tự).", 422);
  }
  if (!isValidEmail(email)) {
    throw new AuthError("Địa chỉ email không hợp lệ.", 422);
  }
  if (!password || password.length < 8 || password.length > 200) {
    throw new AuthError("Mật khẩu cần tối thiểu 8 ký tự.", 422);
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
    .get(email) as { id: number } | undefined;

  if (existing) {
    throw new AuthError("Email này đã được đăng ký. Vui lòng đăng nhập.", 409);
  }

  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const res = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, google_id, role, created_at, updated_at)
       VALUES (?, ?, ?, NULL, 'member', ?, ?)`
    )
    .run(name, email, passwordHash, now, now);

  const created = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(Number(res.lastInsertRowid)) as DbUserRow | undefined;

  if (!created) {
    throw new Error("Could not load newly created user.");
  }
  return created;
}

export function loginUser(params: { email: string; password: string }): DbUserRow {
  const email = normalizeEmail(params.email);
  const password = params.password;

  if (!isValidEmail(email) || !password) {
    throw new AuthError("Email hoặc mật khẩu chưa đúng.", 401);
  }

  const db = getDb();
  const user = db
    .prepare("SELECT * FROM users WHERE LOWER(email) = ?")
    .get(email) as DbUserRow | undefined;

  if (!user || user.role === "editorial") {
    throw new AuthError("Email hoặc mật khẩu chưa đúng.", 401);
  }

  if (!user.password_hash) {
    throw new AuthError(
      "Tài khoản này sử dụng đăng nhập Google. Vui lòng chọn nút Đăng nhập bằng Google.",
      401
    );
  }

  if (!verifyPassword(password, user.password_hash)) {
    throw new AuthError("Email hoặc mật khẩu chưa đúng.", 401);
  }

  return user;
}

export function createSession(userId: number): { token: string; expiresAt: Date } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  db.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(tokenHash, userId, expiresAt.toISOString(), now.toISOString());

  return { token, expiresAt };
}

export function getUserBySessionToken(token: string | undefined | null): DbUserRow | null {
  if (!token || token.length < 16) return null;
  const db = getDb();
  const tokenHash = hashSessionToken(token);

  const row = db
    .prepare(
      `SELECT u.*, s.expires_at AS session_expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    )
    .get(tokenHash) as (DbUserRow & { session_expires_at: string }) | undefined;

  if (!row) return null;

  if (Date.parse(row.session_expires_at) <= Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
    return null;
  }

  if (row.role === "editorial") {
    return null;
  }

  return row;
}

export function destroySession(token: string | undefined | null): void {
  if (!token) return;
  const db = getDb();
  const tokenHash = hashSessionToken(token);
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export async function getAuthenticatedUserFromCookies(): Promise<DbUserRow | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getUserBySessionToken(token);
}

export function buildSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export function buildExpiredCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  };
}

// =====================================================================
// Google OAuth 2.0 SSO (modeled after dapxexuyenviet.vn GoogleController)
// =====================================================================

export interface GoogleUserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  hd?: string;
}

export function getGoogleRedirectUri(requestOrigin?: string): string {
  const explicit = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const appUrl = process.env.APP_URL?.trim() || requestOrigin?.trim() || "";
  if (!appUrl) return "";
  return `${appUrl.replace(/\/+$/, "")}/api/auth/google/callback`;
}

export function isGoogleOAuthConfigured(requestOrigin?: string): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      getGoogleRedirectUri(requestOrigin)
  );
}

export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function buildGoogleAuthorizationUrl(state: string, requestOrigin?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  const redirectUri = getGoogleRedirectUri(requestOrigin);
  if (!clientId || !redirectUri) {
    throw new AuthError("Google Sign-In chưa được cấu hình trên máy chủ.", 503);
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleCodeForProfile(
  code: string,
  requestOrigin?: string
): Promise<GoogleUserProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";
  const redirectUri = getGoogleRedirectUri(requestOrigin);

  if (!clientId || !clientSecret || !redirectUri) {
    throw new AuthError("Google Sign-In chưa được cấu hình đầy đủ.", 503);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    throw new AuthError("Không thể xác thực mã đăng nhập Google.", 401);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new AuthError("Không nhận được access token từ Google.", 401);
  }

  const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    cache: "no-store",
  });

  if (!userInfoRes.ok) {
    throw new AuthError("Không thể tải hồ sơ người dùng từ Google.", 401);
  }

  const profile = (await userInfoRes.json()) as Partial<GoogleUserProfile>;
  return {
    sub: String(profile.sub || ""),
    email: String(profile.email || ""),
    email_verified: profile.email_verified === true,
    name: typeof profile.name === "string" ? profile.name : undefined,
    hd: typeof profile.hd === "string" ? profile.hd : undefined,
  };
}

export function authenticateWithGoogleProfile(profile: GoogleUserProfile): DbUserRow {
  const googleId = profile.sub?.trim();
  if (!googleId || googleId.length > 255) {
    throw new AuthError("Không đọc được định danh Google hợp lệ.", 401);
  }

  const email = normalizeEmail(profile.email || "");
  if (!isValidEmail(email)) {
    throw new AuthError("Tài khoản Google chưa chia sẻ địa chỉ email hợp lệ.", 401);
  }

  if (profile.email_verified !== true) {
    throw new AuthError("Địa chỉ email Google cần được xác minh trước khi đăng nhập.", 401);
  }

  const authoritative = email.endsWith("@gmail.com") || Boolean(profile.hd && profile.hd.trim());
  const db = getDb();
  const now = new Date().toISOString();

  // 1. Prefer stable Google subject ID over mutable email
  const byGoogleId = db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .get(googleId) as DbUserRow | undefined;
  if (byGoogleId) {
    if (byGoogleId.role === "editorial") {
      throw new AuthError("Tài khoản này không hỗ trợ đăng nhập tương tác.", 403);
    }
    return byGoogleId;
  }

  // 2. Safe account linking check by email
  const byEmail = db
    .prepare("SELECT * FROM users WHERE LOWER(email) = ?")
    .get(email) as DbUserRow | undefined;

  if (byEmail) {
    if (byEmail.role === "editorial") {
      throw new AuthError("Tài khoản này không hỗ trợ đăng nhập tương tác.", 403);
    }
    if (byEmail.google_id !== null || !authoritative) {
      throw new AuthError(
        "Email này đã tồn tại tài khoản. Vui lòng đăng nhập bằng mật khẩu hiện có.",
        409
      );
    }

    db.prepare("UPDATE users SET google_id = ?, updated_at = ? WHERE id = ?").run(
      googleId,
      now,
      byEmail.id
    );
    return db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(byEmail.id) as unknown as DbUserRow;
  }

  // 3. Create new member account
  const fallbackName = email.split("@")[0] || "Thành viên";
  const displayName = (profile.name || fallbackName).trim().slice(0, 100) || fallbackName;

  const insertRes = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, google_id, role, created_at, updated_at)
       VALUES (?, ?, NULL, ?, 'member', ?, ?)`
    )
    .run(displayName, email, googleId, now, now);

  return db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(Number(insertRes.lastInsertRowid)) as unknown as DbUserRow;
}

export function verifyFeedbackBearerToken(authorizationHeader: string | null): boolean {
  const configured = process.env.FEEDBACK_API_TOKEN?.trim();
  if (!configured || !authorizationHeader) return false;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const provided = match[1].trim();
  if (!provided) return false;

  const expectedDigest = crypto.createHash("sha256").update(configured).digest();
  const providedDigest = crypto.createHash("sha256").update(provided).digest();
  return crypto.timingSafeEqual(expectedDigest, providedDigest);
}
