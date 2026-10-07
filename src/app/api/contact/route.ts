import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth";
import { EMAIL_RE, PHONE_RE } from "@/lib/enquiry-rules";
import { limited } from "@/lib/ratelimit";
import { createMessage } from "@/lib/store/records";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (limited(req, "contact", 5, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ id: "TB-MS-0000" });

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const m = { name: str(b.name, 120), email: str(b.email, 200), phone: str(b.phone, 20), subject: str(b.subject, 150), body: str(b.body, 3000) };

  const errors: Record<string, string> = {};
  if (m.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(m.email)) errors.email = "Enter a valid email address.";
  if (m.phone && !PHONE_RE.test(m.phone)) errors.phone = "Enter a valid phone number or leave it blank.";
  if (m.body.length < 10) errors.body = "Please tell us a little more (at least 10 characters).";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const id = createMessage({ ...m, subject: m.subject || "General enquiry" });
  return NextResponse.json({ id }, { status: 201 });
}
