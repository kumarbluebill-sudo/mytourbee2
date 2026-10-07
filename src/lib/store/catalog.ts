import "server-only";
import { db, nowIso } from "@/lib/db";
import { allDestinations } from "@/data/destinations";
import { activitiesFull } from "@/data/activities";
import { tours } from "@/data/tours";
import { posts, trending } from "@/data/mytourbee";
import { defaultSettings } from "@/data/types";
import { cruises } from "@/data/cruises";
import { visas } from "@/data/visas";
import { infoPages } from "@/data/pages";

export type Kind = "destination" | "tour" | "activity" | "post" | "cruise" | "visa" | "page" | "settings";

/** Seeds sample content once per kind, so adding a new kind later never touches existing data. */
function seedOnce() {
  const d = db();
  const done = (k: string) => !!d.prepare("SELECT value FROM meta WHERE key=?").get(k);
  const at = nowIso();
  const put = d.prepare("INSERT OR IGNORE INTO catalog (kind, slug, data, updated_at) VALUES (?,?,?,?)");
  const flag = d.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)");
  const run = (key: string, fn: () => void) => {
    if (done(key)) return;
    d.exec("BEGIN");
    try { fn(); flag.run(key, at); d.exec("COMMIT"); } catch (e) { d.exec("ROLLBACK"); throw e; }
  };

  run("seeded", () => {
    const trendingSlugs = new Set(trending.map((t) => t.slug));
    allDestinations.forEach((x) => put.run("destination", x.slug, JSON.stringify({ ...x, trending: trendingSlugs.has(x.slug) }), at));
    tours.forEach((x) => put.run("tour", x.slug, JSON.stringify(x), at));
    activitiesFull.forEach((x) => put.run("activity", x.slug, JSON.stringify(x), at));
    posts.forEach((x) => put.run("post", x.slug, JSON.stringify({ ...x, excerpt: "", body: "" }), at));
    put.run("settings", "site", JSON.stringify(defaultSettings), at);
  });
  run("seeded:cruise", () => cruises.forEach((x) => put.run("cruise", x.slug, JSON.stringify(x), at)));
  run("seeded:visa", () => visas.forEach((x) => put.run("visa", x.slug, JSON.stringify(x), at)));
  run("seeded:page", () => infoPages.forEach((x) => put.run("page", x.slug, JSON.stringify(x), at)));
}

export function listCatalog<T>(kind: Kind): T[] {
  seedOnce();
  return db().prepare("SELECT data FROM catalog WHERE kind=? ORDER BY rowid").all(kind).map((r) => JSON.parse(String(r.data)) as T);
}

export function getCatalog<T>(kind: Kind, slug: string): T | undefined {
  seedOnce();
  const r = db().prepare("SELECT data FROM catalog WHERE kind=? AND slug=?").get(kind, slug);
  return r ? (JSON.parse(String(r.data)) as T) : undefined;
}

export function putCatalog(kind: Kind, slug: string, data: unknown) {
  seedOnce();
  db().prepare(
    "INSERT INTO catalog (kind, slug, data, updated_at) VALUES (?,?,?,?) ON CONFLICT(kind, slug) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at",
  ).run(kind, slug, JSON.stringify(data), nowIso());
}

export function deleteCatalog(kind: Kind, slug: string) {
  seedOnce();
  db().prepare("DELETE FROM catalog WHERE kind=? AND slug=?").run(kind, slug);
}
