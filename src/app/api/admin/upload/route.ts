import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { guard } from "@/lib/admin-api";
import { DATA_DIR } from "@/lib/db";
import { audit } from "@/lib/store/records";

const MAX = 5 * 1024 * 1024;

function detect(b: Buffer): "jpg" | "png" | "webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export async function POST(req: Request) {
  const g = await guard(req, { json: false });
  if (g.error) return g.error;

  let file: FormDataEntryValue | null = null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Image is larger than 5 MB." }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detect(buf);
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG or WebP images are allowed." }, { status: 415 });

  const name = `${randomBytes(8).toString("hex")}.${ext}`;
  await mkdir(path.join(DATA_DIR, "uploads"), { recursive: true });
  await writeFile(path.join(DATA_DIR, "uploads", name), buf);
  audit(g.session.ident, "upload", name);
  return NextResponse.json({ url: `/media/${name}` }, { status: 201 });
}
