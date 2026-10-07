import { NextResponse } from "next/server";
import { isValid, issueCode, normalise, sameOrigin, type Method } from "@/lib/auth";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  let body: { method?: unknown; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const method = body?.method === "email" || body?.method === "mobile" ? (body.method as Method) : null;
  const value = typeof body?.value === "string" ? body.value : "";
  if (!method || !isValid(method, value)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // No email/SMS provider is connected yet. Outside development we refuse instead of pretending.
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const ident = normalise(method, value);
  const issued = issueCode(ident);
  if ("error" in issued) return NextResponse.json({ error: "too_soon" }, { status: 429 });

  console.log(`[auth] sign-in code for ${ident}: ${issued.code}`);
  return NextResponse.json({ sent: true, dev: true });
}
