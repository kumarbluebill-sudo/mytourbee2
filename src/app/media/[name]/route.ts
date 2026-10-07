import { readFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "@/lib/db";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_req: Request, ctx: RouteContext<"/media/[name]">) {
  const { name } = await ctx.params;
  const m = /^([a-f0-9]{16})\.(jpg|png|webp)$/.exec(name);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(path.join(DATA_DIR, "uploads", name));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": TYPES[m[2]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
