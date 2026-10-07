"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Quote } from "@/lib/quote";

type Initial = { date: string; option: string; adults: number; children: number };
const input = "mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ()-]{8,16}$/;

export default function BookingForm({ quote, initial }: { quote: Quote; initial: Initial }) {
  const hasOptions = !!quote.options;
  const isVisa = quote.kind === "visa";
  const isCruise = quote.kind === "cruise";
  const [date, setDate] = useState(isCruise ? (quote.dates?.some((d) => d.value === initial.date) ? initial.date : quote.dates?.[0]?.value ?? "") : initial.date);
  const [option, setOption] = useState(quote.options?.some((o) => o.name === initial.option) ? initial.option : quote.options?.[0]?.name ?? "");
  const [adults, setAdults] = useState(initial.adults);
  const [children, setChildren] = useState(initial.children);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<{ ref: string; total: number } | null>(null);
  const top = useRef<HTMLHeadingElement>(null);

  // Prefill contact details from the signed-in account, if any.
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      const u = j.user;
      if (!u) return;
      if (u.method === "email") setEmail((v) => v || u.ident);
      else setPhone((v) => v || u.ident);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (done) top.current?.focus(); }, [done]);

  const unit = hasOptions ? quote.options?.find((o) => o.name === option)?.price ?? quote.unitPrice : quote.unitPrice;
  const travellers = (Number(adults) || 0) + (Number(children) || 0);
  const total = unit * Math.max(travellers, 0);
  const today = new Date().toISOString().slice(0, 10);

  function check() {
    const e: Record<string, string> = {};
    if (!date || date < today) e.date = "Choose a date from today onwards.";
    if (!(adults >= 1)) e.adults = "At least 1 adult is required.";
    if (adults + children > 20) e.adults = "Up to 20 travellers per booking.";
    if (name.trim().length < 2) e.name = "Please enter the lead traveller's name.";
    if (!EMAIL.test(email)) e.email = "Enter a valid email address.";
    if (!PHONE.test(phone.trim())) e.phone = "Enter a valid phone number.";
    if (!agree) e.agree = "Please accept the terms to continue.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = check();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true); setServerError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: quote.kind, slug: quote.slug, date, option, adults, children, name, email, phone, notes, agree, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) setDone({ ref: json.ref, total: json.total });
      else if (res.status === 422 && json.errors) setErrors(json.errors);
      else setServerError("We couldn't send your booking. Please try again.");
    } catch {
      setServerError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-discount">{errors[k]}</p> : null);

  if (done) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center" aria-live="polite">
        <p className="text-5xl" aria-hidden>✅</p>
        <h2 ref={top} tabIndex={-1} className="mt-3 text-2xl outline-none md:text-3xl">{isVisa ? "Application received" : "Booking request received"}</h2>
        <p className="mt-2">Reference <span className="font-semibold text-heading">{done.ref}</span> · {quote.title} · {inr(done.total)}</p>
        <p className="mx-auto mt-4 max-w-md text-sm">
          Online payment isn&apos;t switched on yet. A MyTourbee travel expert will confirm availability for {date} and send you a secure payment link at {email}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">Back to home</Link>
          <Link href="/tours" className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">Keep exploring</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-8 rounded-3xl border border-line bg-white p-5 md:p-8">
      <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />

      <fieldset>
        <legend className="text-xl font-bold text-heading">{isVisa ? "1. Application details" : hasOptions ? "1. Date & options" : "1. Trip details"}</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-heading">{isCruise ? "Departure date" : isVisa ? "Intended travel date" : hasOptions ? "Date" : "Travel date"}
            {isCruise ? (
              <select value={date} onChange={(e) => setDate(e.target.value)} className={input}>{quote.dates?.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</select>
            ) : (
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={input} />
            )}
            {err("date")}
          </label>
          {hasOptions && (
            <label className="block text-sm font-medium text-heading">{isCruise ? "Cabin" : "Option"}
              <select value={option} onChange={(e) => setOption(e.target.value)} className={input}>
                {quote.options?.map((o) => <option key={o.name} value={o.name}>{o.name} — {o.detail} ({inr(o.price)})</option>)}
              </select>
            </label>
          )}
          <label className="block text-sm font-medium text-heading">{isVisa ? "Applicants (adults)" : "Adults"}
            <input type="number" inputMode="numeric" min={1} max={20} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={input} />
            {err("adults")}
          </label>
          <label className="block text-sm font-medium text-heading">{isVisa ? "Applicants (children)" : "Children"}
            <input type="number" inputMode="numeric" min={0} max={20} value={children} onChange={(e) => setChildren(Number(e.target.value))} className={input} />
          </label>
        </div>
        <p className="mt-3 text-sm">
          {isVisa ? "Our team checks the latest visa rules, tells you which documents to send, and then shares a payment link. You are not charged now." : "Availability for your date is confirmed by our team after you send this request. You are not charged now."}
        </p>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-heading">{isVisa ? "2. Lead applicant" : "2. Lead traveller"}</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-heading">Full name
            <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
            {err("name")}
          </label>
          <label className="block text-sm font-medium text-heading">Phone
            <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
            {err("phone")}
          </label>
          <label className="block text-sm font-medium text-heading sm:col-span-2">Email
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            {err("email")}
          </label>
          <label className="block text-sm font-medium text-heading sm:col-span-2">Special requests (optional)
            <textarea rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${input} py-2`} />
          </label>
        </div>
      </fieldset>

      <div className="rounded-2xl bg-surface p-5">
        <div className="flex items-center justify-between"><span>{inr(unit)} × {travellers || 0} {isVisa ? (travellers === 1 ? "applicant" : "applicants") : travellers === 1 ? "traveller" : "travellers"}</span></div>
        <div className="mt-2 flex items-center justify-between text-lg font-bold text-heading"><span>Estimated total</span><span>{inr(total)}</span></div>
        <p className="mt-2 text-xs">Taxes and final price are confirmed by our team.</p>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0" />
          <span>I agree to the <Link href="/terms" className="underline">Terms</Link>, <Link href="/cancellation" className="underline">Cancellation Policy</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</span>
        </label>
        {err("agree")}
      </div>

      {serverError && <p role="alert" className="text-sm text-discount">{serverError}</p>}
      <button disabled={busy} className="min-h-12 w-full rounded-full bg-primary px-8 font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto">
        {busy ? "Sending…" : isVisa ? "Start application" : quote.kind === "tour" ? "Book Now" : "Request Booking"}
      </button>
    </form>
  );
}
