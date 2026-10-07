import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "tb_session";
const SESSION_DAYS = 30;
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?[0-9 ()-]{8,16}$/;

export type Method = "email" | "mobile";
export type Session = { ident: string; method: Method; exp: number };

type CodeEntry = { hash: string; exp: number; attempts: number; sentAt: number };
// Survives hot reloads in dev. Replace with Redis/PostgreSQL when the backend exists.
const g = globalThis as unknown as { __tbCodes?: Map<string, CodeEntry> };
const codes = (g.__tbCodes ??= new Map<string, CodeEntry>());

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set in production");
  return "dev-only-secret-do-not-use-in-production";
}
const hmac = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");
const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function normalise(method: Method, value: string) {
  const v = value.trim();
  return method === "email" ? v.toLowerCase() : v.replace(/[\s()-]/g, "");
}
export function isValid(method: Method, value: string) {
  return method === "email" ? EMAIL_RE.test(value.trim()) : PHONE_RE.test(value.trim());
}

/** Returns the plain code to deliver, or an error reason. */
export function issueCode(ident: string): { code: string } | { error: "too_soon" } {
  const now = Date.now();
  const prev = codes.get(ident);
  if (prev && now - prev.sentAt < RESEND_MS) return { error: "too_soon" };
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  codes.set(ident, { hash: hmac(`${ident}:${code}`), exp: now + CODE_TTL_MS, attempts: 0, sentAt: now });
  return { code };
}

export function checkCode(ident: string, code: string): "ok" | "invalid" | "expired" | "locked" {
  const entry = codes.get(ident);
  if (!entry || Date.now() > entry.exp) { codes.delete(ident); return "expired"; }
  if (entry.attempts >= MAX_ATTEMPTS) return "locked";
  entry.attempts += 1;
  if (!safeEq(entry.hash, hmac(`${ident}:${code}`))) return "invalid";
  codes.delete(ident);
  return "ok";
}

export function signSession(s: Omit<Session, "exp">) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const body = Buffer.from(JSON.stringify({ ...s, exp })).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function readSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEq(sig, hmac(body))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return s.exp > Date.now() && s.ident ? s : null;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86400,
};

/** Basic CSRF defence for JSON POSTs: require JSON and a same-origin Origin header when present. */
export function sameOrigin(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json")) return false;
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}

export function maskIdent(ident: string) {
  if (ident.includes("@")) {
    const [u, d] = ident.split("@");
    return `${u.slice(0, 2)}***@${d}`;
  }
  return `${ident.slice(0, 3)}*****${ident.slice(-2)}`;
}

export async function getSession() {
  return readSession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Admins are the verified email addresses listed in ADMIN_EMAILS (comma separated). */
export function isAdmin(s: Session | null) {
  if (!s || s.method !== "email") return false;
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  return list.includes(s.ident);
}

/** For API routes: returns the admin session, or null if the caller must be refused. */
export async function adminSession() {
  const s = await getSession();
  return isAdmin(s) ? s : null;
}

/** For pages: layouts and pages render at the same time, so each page must check the session itself. */
export async function requireSession(next = "/account") {
  const s = await getSession();
  if (!s) redirect(`/login?next=${next}`);
  return s;
}

export async function requireAdminSession() {
  const s = await requireSession("/admin");
  if (!isAdmin(s)) notFound();
  return s;
}
