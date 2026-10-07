import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth";
import { EMAIL_RE } from "@/lib/enquiry-rules";
import { limited } from "@/lib/ratelimit";
import { addSubscriber } from "@/lib/store/records";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (limited(req, "subscribe", 5, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  let b: { email?: unknown; website?: unknown };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = typeof b?.email === "string" ? b.email.trim().slice(0, 200) : "";
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  if (!b.website) addSubscriber(email);
  return NextResponse.json({ ok: true }, { status: 201 });
}
