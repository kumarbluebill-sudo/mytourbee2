import { EMAIL_RE, PHONE_RE } from "@/lib/enquiry-rules";

export type BookingInput = {
  kind: "tour" | "activity" | "cruise" | "visa";
  slug: string;
  date: string;
  option: string; // activities only
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  agree: boolean;
  website: string; // honeypot
};

export const maxTravellers = 20;

export function validateBooking(b: BookingInput): Record<string, string> {
  const e: Record<string, string> = {};
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || b.date < today) e.date = "Choose a date from today onwards.";
  if (!Number.isInteger(b.adults) || b.adults < 1) e.adults = "At least 1 adult is required.";
  if (!Number.isInteger(b.children) || b.children < 0) e.children = "Children must be 0 or more.";
  if (Number.isInteger(b.adults) && Number.isInteger(b.children) && b.adults + b.children > maxTravellers) e.adults = `Up to ${maxTravellers} travellers per booking.`;
  if (typeof b.name !== "string" || b.name.trim().length < 2) e.name = "Please enter the lead traveller's name.";
  if (typeof b.email !== "string" || !EMAIL_RE.test(b.email)) e.email = "Enter a valid email address.";
  if (typeof b.phone !== "string" || !PHONE_RE.test(b.phone.trim())) e.phone = "Enter a valid phone number.";
  if (!b.agree) e.agree = "Please accept the terms to continue.";
  return e;
}
