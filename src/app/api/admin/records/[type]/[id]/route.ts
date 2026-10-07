import { NextResponse } from "next/server";
import { guard, readJson } from "@/lib/admin-api";
import {
  audit, BOOKING_STATUSES, ENQUIRY_STATUSES, MESSAGE_STATUSES, PAYMENT_STATUSES, REVIEW_STATUSES,
  updateBooking, updateEnquiry, updateMessage, updateReview,
} from "@/lib/store/records";
import { revalidatePath } from "next/cache";

const oneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] => typeof v === "string" && (list as readonly string[]).includes(v);

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/records/[type]/[id]">) {
  const g = await guard(req);
  if (g.error) return g.error;
  const { type, id } = await ctx.params;
  const b = await readJson(req);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 2000) : undefined;

  let ok = false;
  if (type === "enquiries") {
    if (b.status !== undefined && !oneOf(ENQUIRY_STATUSES, b.status)) return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    ok = updateEnquiry(id, { status: b.status, note });
  } else if (type === "bookings") {
    if (b.status !== undefined && !oneOf(BOOKING_STATUSES, b.status)) return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    if (b.payment !== undefined && !oneOf(PAYMENT_STATUSES, b.payment)) return NextResponse.json({ error: "Invalid payment status" }, { status: 422 });
    ok = updateBooking(id, { status: b.status, payment: b.payment, note });
  } else if (type === "reviews") {
    if (!oneOf(REVIEW_STATUSES, b.status)) return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    ok = updateReview(id, b.status);
    revalidatePath("/", "layout");
  } else if (type === "messages") {
    if (!oneOf(MESSAGE_STATUSES, b.status)) return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    ok = updateMessage(id, b.status);
  } else {
    return NextResponse.json({ error: "Unknown type" }, { status: 404 });
  }
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  audit(g.session.ident, "update", `${type}:${id}`);
  return NextResponse.json({ ok: true });
}
