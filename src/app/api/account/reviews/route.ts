import { NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { createReview, getBookingFor, getUser, reviewForBooking } from "@/lib/store/records";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const bookingId = typeof b?.bookingId === "string" ? b.bookingId : "";
  const rating = Number(b?.rating);
  const text = typeof b?.text === "string" ? b.text.trim().slice(0, 1000) : "";
  const city = typeof b?.city === "string" ? b.city.trim().slice(0, 60) : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 422 });
  if (text.length < 10) return NextResponse.json({ error: "Please write at least 10 characters." }, { status: 422 });

  const booking = getBookingFor(bookingId, s.ident);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "completed") return NextResponse.json({ error: "You can review a trip after it is completed." }, { status: 403 });
  if (reviewForBooking(bookingId)) return NextResponse.json({ error: "You have already reviewed this trip." }, { status: 409 });

  const first = (getUser(s.ident)?.name || booking.data.name).trim().split(/\s+/);
  const name = first.length > 1 ? `${first[0]} ${first[first.length - 1][0]}.` : first[0];
  createReview({ owner: s.ident, bookingId, kind: booking.kind, slug: booking.slug, title: booking.title, name, city, rating, text });
  return NextResponse.json({ ok: true }, { status: 201 });
}
