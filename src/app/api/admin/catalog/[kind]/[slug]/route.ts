import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { guard, readJson } from "@/lib/admin-api";
import { sanitize, type EntityKind } from "@/lib/admin-schema";
import { audit } from "@/lib/store/records";
import { deleteCatalog, getCatalog, listCatalog, putCatalog } from "@/lib/store/catalog";

const KINDS = ["destination", "tour", "activity", "post", "cruise", "visa", "settings"] as const;
const known = (k: string): k is EntityKind => (KINDS as readonly string[]).includes(k);

export async function PUT(req: Request, ctx: RouteContext<"/api/admin/catalog/[kind]/[slug]">) {
  const g = await guard(req);
  if (g.error) return g.error;
  const { kind, slug } = await ctx.params;
  if (!known(kind) || (kind === "settings" && slug !== "site")) return NextResponse.json({ error: "Unknown type" }, { status: 404 });
  if (kind !== "settings" && !getCatalog(kind, slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await readJson(req);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const dests = listCatalog<{ slug: string }>("destination").map((d) => d.slug);
  const { data, errors } = sanitize(kind, body.data, slug, dests);
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  putCatalog(kind, slug, data);
  audit(g.session.ident, "update", `${kind}:${slug}`);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/admin/catalog/[kind]/[slug]">) {
  const g = await guard(req, { json: false });
  if (g.error) return g.error;
  const { kind, slug } = await ctx.params;
  if (!known(kind) || kind === "settings") return NextResponse.json({ error: "Unknown type" }, { status: 404 });
  if (!getCatalog(kind, slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (kind === "destination") {
    const used = [...listCatalog<{ destination: string }>("tour"), ...listCatalog<{ destination: string }>("activity")].filter((x) => x.destination === slug).length;
    if (used) return NextResponse.json({ error: `${used} tour(s) or activities still use this destination. Move or delete them first.` }, { status: 409 });
  }
  deleteCatalog(kind, slug);
  audit(g.session.ident, "delete", `${kind}:${slug}`);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
