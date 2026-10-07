import "server-only";
import { NextResponse } from "next/server";
import { adminSession, sameOrigin } from "@/lib/auth";

/** Every admin API call goes through this: JSON + same-origin + a signed-in admin. */
export async function guard(req: Request, opts: { json?: boolean } = { json: true }) {
  const originHeader = req.headers.get("origin");
  const originOk = opts.json === false ? originHeader === new URL(req.url).origin : sameOrigin(req);
  if (!originOk) return { error: NextResponse.json({ error: "Invalid request" }, { status: 400 }) };
  const session = await adminSession();
  if (!session) return { error: NextResponse.json({ error: "Not allowed" }, { status: 403 }) };
  return { session };
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
