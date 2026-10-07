import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { maskIdent, readSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const s = readSession((await cookies()).get(SESSION_COOKIE)?.value);
  const res = NextResponse.json(s ? { user: { ident: s.ident, label: maskIdent(s.ident), method: s.method } } : { user: null });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
