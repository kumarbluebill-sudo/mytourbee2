import { NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { EMAIL_RE, PHONE_RE } from "@/lib/enquiry-rules";
import { ensureUser, getUser, updateUser } from "@/lib/store/records";

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(b?.name, 120);
  // The sign-in identifier is verified, so it can't be edited here.
  ensureUser(s.ident, s.method);
  const cur = getUser(s.ident)!;
  const email = s.method === "email" ? cur.email : str(b?.email, 200);
  const phone = s.method === "mobile" ? cur.phone : str(b?.phone, 20);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (email && !EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (phone && !PHONE_RE.test(phone)) errors.phone = "Enter a valid phone number.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  updateUser(s.ident, { name, email, phone });
  return NextResponse.json({ ok: true });
}
