import { NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { validateBooking, type BookingInput } from "@/lib/booking";
import { limited } from "@/lib/ratelimit";
import { getQuote, totalFor } from "@/lib/quote";
import { createBooking } from "@/lib/store/records";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (limited(req, "booking", 8, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let b: BookingInput;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ref: "TB-BK-0000", total: 0 });

  const quote = typeof b.slug === "string" ? await getQuote(String(b.kind), b.slug, typeof b.option === "string" ? b.option : undefined) : null;
  if (!quote) return NextResponse.json({ error: "Unknown item" }, { status: 404 });

  const errors = validateBooking(b);
  if (quote.kind === "cruise" && !quote.dates?.some((d) => d.value === b.date)) errors.date = "Choose one of the available departure dates.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const session = await getSession();
  const ref = createBooking({
    owner: session?.ident ?? null,
    email: b.email.trim(),
    phone: b.phone.trim(),
    kind: quote.kind,
    slug: quote.slug,
    title: quote.title,
    travelDate: b.date,
    travellers: b.adults + b.children,
    total: totalFor(quote, b),
    data: {
      name: b.name.trim().slice(0, 120),
      adults: b.adults,
      children: b.children,
      option: quote.options ? (quote.options?.find((o) => o.name === b.option)?.name ?? quote.options?.[0]?.name ?? "") : "",
      notes: String(b.notes ?? "").slice(0, 1000),
    },
  });
  return NextResponse.json({ ref, total: totalFor(quote, b), title: quote.title }, { status: 201 });
}
