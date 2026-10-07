"use client";

import { useState } from "react";

const input = "mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";
const subjects = ["General enquiry", "Booking help", "Plan a trip", "Cancellation or change", "Feedback"];

export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: subjects[0], body: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState("");
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const err = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-discount">{errors[k]}</p> : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setServerError(""); setErrors({});
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await res.json().catch(() => ({}));
      if (res.ok) setDone(j.id);
      else if (res.status === 422 && j.errors) setErrors(j.errors);
      else setServerError(j.error ?? "Something went wrong. Please try again.");
    } catch {
      setServerError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-surface p-8 text-center" role="status">
        <p className="text-4xl" aria-hidden>✅</p>
        <h2 className="mt-2 text-2xl">Message sent</h2>
        <p className="mt-2">Thank you. A MyTourbee travel expert will reply soon. Reference {done}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-3xl border border-line bg-white p-5 sm:grid-cols-2 md:p-8">
      <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" name="website" value={f.website} onChange={(e) => set("website", e.target.value)} />
      <label className="block text-sm font-medium text-heading">Full name
        <input autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} className={input} />{err("name")}
      </label>
      <label className="block text-sm font-medium text-heading">Email
        <input type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={input} />{err("email")}
      </label>
      <label className="block text-sm font-medium text-heading">Phone (optional)
        <input type="tel" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={input} />{err("phone")}
      </label>
      <label className="block text-sm font-medium text-heading">Subject
        <select value={f.subject} onChange={(e) => set("subject", e.target.value)} className={input}>{subjects.map((s) => <option key={s}>{s}</option>)}</select>
      </label>
      <label className="block text-sm font-medium text-heading sm:col-span-2">How can we help?
        <textarea rows={5} maxLength={3000} value={f.body} onChange={(e) => set("body", e.target.value)} className={`${input} py-2`} />{err("body")}
      </label>
      {serverError && <p role="alert" className="text-sm text-discount sm:col-span-2">{serverError}</p>}
      <div className="sm:col-span-2">
        <button disabled={busy} className="min-h-12 rounded-full bg-primary px-8 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">{busy ? "Sending…" : "Send enquiry"}</button>
      </div>
    </form>
  );
}
