import { NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { validate, type Enquiry } from "@/lib/enquiry";
import { limited } from "@/lib/ratelimit";
import { createEnquiry } from "@/lib/store/records";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (limited(req, "enquiry", 5, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body: Enquiry;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Honeypot: pretend success so bots learn nothing.
  if (body.website) return NextResponse.json({ id: "TB-0000" });

  let errors: Record<string, string>;
  try {
    errors = validate(body, "all");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const clean: Enquiry = {
    ...body,
    destinations: body.destinations.slice(0, 20).map((d) => String(d).slice(0, 80)),
    styles: Array.isArray(body.styles) ? body.styles.slice(0, 10).map((d) => String(d).slice(0, 40)) : [],
    otherPlace: String(body.otherPlace ?? "").slice(0, 200),
    message: String(body.message ?? "").slice(0, 1000),
    name: body.name.trim().slice(0, 120),
    source: String(body.source ?? "").slice(0, 80),
  };
  const session = await getSession();
  const id = createEnquiry(clean, session?.ident ?? null);
  return NextResponse.json({ id }, { status: 201 });
}
