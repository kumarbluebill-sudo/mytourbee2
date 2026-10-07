import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/store/records";
import { checkCode, cookieOptions, isValid, normalise, sameOrigin, SESSION_COOKIE, signSession, type Method } from "@/lib/auth";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  let body: { method?: unknown; value?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const method = body?.method === "email" || body?.method === "mobile" ? (body.method as Method) : null;
  const value = typeof body?.value === "string" ? body.value : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!method || !isValid(method, value) || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const ident = normalise(method, value);
  const result = checkCode(ident, code);
  if (result !== "ok") {
    const status = result === "locked" ? 429 : 401;
    return NextResponse.json({ error: result }, { status });
  }

  ensureUser(ident, method);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, signSession({ ident, method }), cookieOptions);
  return res;
}
