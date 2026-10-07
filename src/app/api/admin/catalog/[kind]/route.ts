import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { guard, readJson } from "@/lib/admin-api";
import { sanitize, schemas, slugify, SLUG_RE, type EntityKind } from "@/lib/admin-schema";
import { audit } from "@/lib/store/records";
import { getCatalog, listCatalog, putCatalog } from "@/lib/store/catalog";

const KINDS = ["destination", "tour", "activity", "post", "cruise", "visa"] as const;

export async function POST(req: Request, ctx: RouteContext<"/api/admin/catalog/[kind]">) {
  const g = await guard(req);
  if (g.error) return g.error;
  const { kind } = await ctx.params;
  if (!(KINDS as readonly string[]).includes(kind)) return NextResponse.json({ error: "Unknown type" }, { status: 404 });

  const body = await readJson(req);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const titleKey = schemas[kind as EntityKind].titleKey;
  const slug = slugify(typeof body.slug === "string" && body.slug ? body.slug : String(body.data?.[titleKey] ?? ""));
  if (!slug || slug === "new" || !SLUG_RE.test(slug)) return NextResponse.json({ errors: { _slug: "Enter a title so a web address can be created." } }, { status: 422 });
  if (getCatalog(kind as EntityKind, slug)) return NextResponse.json({ errors: { _slug: `"${slug}" already exists. Choose a different title or web address.` } }, { status: 409 });

  const dests = listCatalog<{ slug: string }>("destination").map((d) => d.slug);
  const { data, errors } = sanitize(kind as EntityKind, body.data, slug, dests);
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  putCatalog(kind as EntityKind, slug, data);
  audit(g.session.ident, "create", `${kind}:${slug}`);
  revalidatePath("/", "layout");
  return NextResponse.json({ slug }, { status: 201 });
}
