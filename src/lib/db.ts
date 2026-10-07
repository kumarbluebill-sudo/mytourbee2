import "server-only";
import { accessSync, constants, mkdirSync } from "node:fs";
import os from "node:os";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

/**
 * Local SQLite database (Node's built-in driver). Everything goes through the
 * functions in src/lib/store/*, so moving to PostgreSQL later only means
 * re-implementing those.
 */
/**
 * Where the database and uploads live. Set DATA_DIR to a persistent disk in production.
 * Hosts with a read-only project folder (e.g. serverless) fall back to the temp directory,
 * which works but is NOT persistent: data there is lost on restart.
 */
function resolveDataDir() {
  const wanted = process.env.DATA_DIR || path.join(process.cwd(), ".data");
  try {
    mkdirSync(wanted, { recursive: true });
    accessSync(wanted, constants.W_OK);
    return wanted;
  } catch {
    const fallback = path.join(os.tmpdir(), "mytourbee-data");
    mkdirSync(fallback, { recursive: true });
    console.warn(`[db] ${wanted} is not writable; using ${fallback}. Data will not persist. Set DATA_DIR to a persistent disk.`);
    return fallback;
  }
}
export const DATA_DIR = resolveDataDir();

const g = globalThis as unknown as { __tbDb?: DatabaseSync };

function open(): DatabaseSync {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "mytourbee.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS catalog (
      kind TEXT NOT NULL, slug TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL,
      PRIMARY KEY (kind, slug)
    );
    CREATE TABLE IF NOT EXISTS users (
      ident TEXT PRIMARY KEY, method TEXT NOT NULL, name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, owner TEXT, email TEXT NOT NULL, phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new', note TEXT NOT NULL DEFAULT '', data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, owner TEXT, email TEXT NOT NULL, phone TEXT NOT NULL,
      kind TEXT NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL, travel_date TEXT NOT NULL, travellers INTEGER NOT NULL,
      total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', payment TEXT NOT NULL DEFAULT 'unpaid',
      note TEXT NOT NULL DEFAULT '', data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, owner TEXT NOT NULL, booking_id TEXT NOT NULL,
      kind TEXT NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL, name TEXT NOT NULL, city TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
      subject TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new'
    );
    CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL
    );
  `);
  return db;
}

export const db = () => (g.__tbDb ??= open());
export const nowIso = () => new Date().toISOString();
export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
