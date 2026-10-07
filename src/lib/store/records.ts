import "server-only";
import { db, newId, nowIso } from "@/lib/db";
import type { Enquiry } from "@/lib/enquiry";

type Row = Record<string, unknown>;
const s = (v: unknown) => String(v ?? "");
const normPhone = (v: string) => v.trim().replace(/[s()-]/g, "");

// ---------- enquiries ----------
export const ENQUIRY_STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
export type EnquiryRow = { id: string; createdAt: string; owner: string | null; email: string; phone: string; status: string; note: string; data: Enquiry };
const toEnquiry = (r: Row): EnquiryRow => ({
  id: s(r.id), createdAt: s(r.created_at), owner: r.owner ? s(r.owner) : null, email: s(r.email), phone: s(r.phone),
  status: s(r.status), note: s(r.note), data: JSON.parse(s(r.data)),
});
export function createEnquiry(data: Enquiry, owner: string | null) {
  const id = newId("TB-EQ");
  db().prepare("INSERT INTO enquiries (id, created_at, owner, email, phone, data) VALUES (?,?,?,?,?,?)")
    .run(id, nowIso(), owner, data.email.trim().toLowerCase(), normPhone(data.phone), JSON.stringify({ ...data, website: "" }));
  return id;
}
export const listEnquiries = () => db().prepare("SELECT * FROM enquiries ORDER BY created_at DESC").all().map(toEnquiry);
export function listEnquiriesFor(ident: string) {
  return db().prepare("SELECT * FROM enquiries WHERE owner=? OR email=? OR phone=? ORDER BY created_at DESC").all(ident, ident, ident).map(toEnquiry);
}
export function updateEnquiry(id: string, patch: { status?: string; note?: string }) {
  const cur = db().prepare("SELECT status, note FROM enquiries WHERE id=?").get(id);
  if (!cur) return false;
  db().prepare("UPDATE enquiries SET status=?, note=? WHERE id=?").run(patch.status ?? s(cur.status), patch.note ?? s(cur.note), id);
  return true;
}

// ---------- bookings ----------
export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
export type BookingRow = {
  id: string; createdAt: string; owner: string | null; email: string; phone: string; kind: "tour" | "activity" | "cruise" | "visa"; slug: string; title: string;
  travelDate: string; travellers: number; total: number; status: string; payment: string; note: string;
  data: { name: string; adults: number; children: number; option: string; notes: string };
};
const toBooking = (r: Row): BookingRow => ({
  id: s(r.id), createdAt: s(r.created_at), owner: r.owner ? s(r.owner) : null, email: s(r.email), phone: s(r.phone),
  kind: s(r.kind) as BookingRow["kind"], slug: s(r.slug), title: s(r.title), travelDate: s(r.travel_date),
  travellers: Number(r.travellers), total: Number(r.total), status: s(r.status), payment: s(r.payment), note: s(r.note),
  data: JSON.parse(s(r.data)),
});
export function createBooking(b: Omit<BookingRow, "id" | "createdAt" | "status" | "payment" | "note">) {
  const id = newId("TB-BK");
  db().prepare(
    "INSERT INTO bookings (id, created_at, owner, email, phone, kind, slug, title, travel_date, travellers, total, data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
  ).run(id, nowIso(), b.owner, b.email.toLowerCase(), normPhone(b.phone), b.kind, b.slug, b.title, b.travelDate, b.travellers, b.total, JSON.stringify(b.data));
  return id;
}
export const listBookings = () => db().prepare("SELECT * FROM bookings ORDER BY created_at DESC").all().map(toBooking);
export function listBookingsFor(ident: string) {
  return db().prepare("SELECT * FROM bookings WHERE owner=? OR email=? OR phone=? ORDER BY created_at DESC").all(ident, ident, ident).map(toBooking);
}
export function getBookingFor(id: string, ident: string) {
  const r = db().prepare("SELECT * FROM bookings WHERE id=? AND (owner=? OR email=? OR phone=?)").get(id, ident, ident, ident);
  return r ? toBooking(r) : undefined;
}
export function updateBooking(id: string, patch: { status?: string; payment?: string; note?: string }) {
  const cur = db().prepare("SELECT status, payment, note FROM bookings WHERE id=?").get(id);
  if (!cur) return false;
  db().prepare("UPDATE bookings SET status=?, payment=?, note=? WHERE id=?")
    .run(patch.status ?? s(cur.status), patch.payment ?? s(cur.payment), patch.note ?? s(cur.note), id);
  return true;
}

// ---------- reviews ----------
export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewRow = { id: string; createdAt: string; owner: string; bookingId: string; kind: string; slug: string; title: string; name: string; city: string; rating: number; text: string; status: string };
const toReview = (r: Row): ReviewRow => ({
  id: s(r.id), createdAt: s(r.created_at), owner: s(r.owner), bookingId: s(r.booking_id), kind: s(r.kind), slug: s(r.slug),
  title: s(r.title), name: s(r.name), city: s(r.city), rating: Number(r.rating), text: s(r.text), status: s(r.status),
});
export function createReview(r: { owner: string; bookingId: string; kind: string; slug: string; title: string; name: string; city: string; rating: number; text: string }) {
  const id = newId("TB-RV");
  db().prepare("INSERT INTO reviews (id, created_at, owner, booking_id, kind, slug, title, name, city, rating, text) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .run(id, nowIso(), r.owner, r.bookingId, r.kind, r.slug, r.title, r.name, r.city, r.rating, r.text);
  return id;
}
export const listReviews = () => db().prepare("SELECT * FROM reviews ORDER BY created_at DESC").all().map(toReview);
export const listReviewsFor = (owner: string) => db().prepare("SELECT * FROM reviews WHERE owner=? ORDER BY created_at DESC").all(owner).map(toReview);
export const reviewForBooking = (bookingId: string) => {
  const r = db().prepare("SELECT * FROM reviews WHERE booking_id=?").get(bookingId);
  return r ? toReview(r) : undefined;
};
export function updateReview(id: string, status: string) {
  return db().prepare("UPDATE reviews SET status=? WHERE id=?").run(status, id).changes > 0;
}

// ---------- contact messages + subscribers ----------
export const MESSAGE_STATUSES = ["new", "replied", "closed"] as const;
export type MessageRow = { id: string; createdAt: string; name: string; email: string; phone: string; subject: string; body: string; status: string };
const toMessage = (r: Row): MessageRow => ({
  id: s(r.id), createdAt: s(r.created_at), name: s(r.name), email: s(r.email), phone: s(r.phone), subject: s(r.subject), body: s(r.body), status: s(r.status),
});
export function createMessage(m: Omit<MessageRow, "id" | "createdAt" | "status">) {
  const id = newId("TB-MS");
  db().prepare("INSERT INTO messages (id, created_at, name, email, phone, subject, body) VALUES (?,?,?,?,?,?,?)")
    .run(id, nowIso(), m.name, m.email.toLowerCase(), normPhone(m.phone), m.subject, m.body);
  return id;
}
export const listMessages = () => db().prepare("SELECT * FROM messages ORDER BY created_at DESC").all().map(toMessage);
export const updateMessage = (id: string, status: string) => db().prepare("UPDATE messages SET status=? WHERE id=?").run(status, id).changes > 0;
export const addSubscriber = (email: string) => db().prepare("INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?,?)").run(email.toLowerCase(), nowIso());
export const listSubscribers = () => db().prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC").all().map((r) => ({ email: s(r.email), createdAt: s(r.created_at) }));

// ---------- users (profile) ----------
export type UserRow = { ident: string; method: string; name: string; email: string; phone: string };
export function getUser(ident: string): UserRow | undefined {
  const r = db().prepare("SELECT * FROM users WHERE ident=?").get(ident);
  return r ? { ident: s(r.ident), method: s(r.method), name: s(r.name), email: s(r.email), phone: s(r.phone) } : undefined;
}
export function ensureUser(ident: string, method: string) {
  const at = nowIso();
  db().prepare("INSERT OR IGNORE INTO users (ident, method, email, phone, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run(ident, method, method === "email" ? ident : "", method === "mobile" ? ident : "", at, at);
}
export function updateUser(ident: string, p: { name: string; email: string; phone: string }) {
  db().prepare("UPDATE users SET name=?, email=?, phone=?, updated_at=? WHERE ident=?").run(p.name, p.email, p.phone, nowIso(), ident);
}
export const listUsers = () => db().prepare("SELECT * FROM users ORDER BY created_at DESC").all().map((r) => ({ ident: s(r.ident), method: s(r.method), name: s(r.name), createdAt: s(r.created_at) }));

// ---------- audit ----------
export function audit(actor: string, action: string, target: string) {
  db().prepare("INSERT INTO audit (at, actor, action, target) VALUES (?,?,?,?)").run(nowIso(), actor, action, target);
}
export const listAudit = (limit = 50) =>
  db().prepare("SELECT at, actor, action, target FROM audit ORDER BY id DESC LIMIT ?").all(limit).map((r) => ({ at: s(r.at), actor: s(r.actor), action: s(r.action), target: s(r.target) }));
