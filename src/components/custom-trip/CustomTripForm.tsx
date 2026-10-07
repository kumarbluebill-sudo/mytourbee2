"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { budgets, emptyEnquiry, nightOptions, styleOptions, validate, type Enquiry } from "@/lib/enquiry";

type Place = { slug: string; name: string };
const steps = ["Where?", "When & Who?", "Style & Budget", "Your Details"] as const;
const input = "mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={on}
      className={`min-h-11 rounded-full border px-5 text-sm font-medium ${on ? "border-primary bg-primary text-white" : "border-line bg-white text-heading hover:border-primary"}`}
    >
      {children}
    </button>
  );
}

export default function CustomTripForm({ places, initial }: { places: Place[]; initial: Partial<Enquiry> }) {
  const [data, setData] = useState<Enquiry>({ ...emptyEnquiry, ...initial });
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [doneId, setDoneId] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step, doneId]);

  const set = <K extends keyof Enquiry>(k: K, v: Enquiry[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggle = (k: "destinations" | "styles", v: string) =>
    set(k, data[k].includes(v) ? data[k].filter((x) => x !== v) : [...data[k], v]);

  function next() {
    const e = validate(data, step);
    setErrors(e);
    if (!Object.keys(e).length) setStep((s) => (s < 4 ? ((s + 1) as 2 | 3 | 4) : s));
  }

  async function submit() {
    const e = validate(data, 4);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true); setServerError("");
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (res.ok) setDoneId(json.id);
      else if (res.status === 422 && json.errors) {
        setErrors(json.errors);
        const bad = Object.keys(json.errors);
        setStep(bad.some((k) => k === "destinations") ? 1 : bad.some((k) => ["startDate", "adults", "children"].includes(k)) ? 2 : bad.includes("budget") ? 3 : 4);
      } else setServerError("Something went wrong. Please try again or call us.");
    } catch {
      setServerError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-discount">{errors[k]}</p> : null);

  if (doneId) {
    return (
      <div className="rounded-3xl bg-surface p-8 text-center md:p-12" aria-live="polite">
        <p className="text-5xl" aria-hidden>🎉</p>
        <h2 ref={heading} tabIndex={-1} className="mt-3 text-2xl outline-none md:text-3xl">Your request is on its way!</h2>
        <p className="mt-2">A MyTourbee travel expert will contact you on {data.contactVia} soon.</p>
        <p className="mt-4 text-sm">Reference: <span className="font-semibold text-heading">{doneId}</span></p>
        <Link href="/tours" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">Browse tour packages</Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (step === 4) submit(); else next(); }} noValidate className="rounded-3xl border border-line bg-white p-5 shadow-sm md:p-8">
      <ol className="flex gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className="flex-1" aria-current={step === i + 1 ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${i + 1 <= step ? "bg-accent" : "bg-line"}`} />
            <p className={`mt-2 hidden text-xs sm:block ${step === i + 1 ? "font-semibold text-heading" : ""}`}>{i + 1}. {s}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm sm:hidden">Step {step} of 4 · {steps[step - 1]}</p>

      <h2 ref={heading} tabIndex={-1} className="mt-6 text-2xl outline-none">
        {["Where do you want to go?", "When and who is travelling?", "What kind of trip and budget?", "How can we reach you?"][step - 1]}
      </h2>

      {/* honeypot */}
      <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" name="website" value={data.website} onChange={(e) => set("website", e.target.value)} />

      {step === 1 && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Destinations">
            {places.map((p) => <Chip key={p.slug} on={data.destinations.includes(p.name)} onClick={() => toggle("destinations", p.name)}>{p.name}</Chip>)}
          </div>
          {err("destinations")}
          <label className="mt-5 block text-sm font-medium text-heading">Somewhere else?
            <input className={input} value={data.otherPlace} onChange={(e) => set("otherPlace", e.target.value)} placeholder="e.g. Maldives, Vietnam" />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-heading">Start date
              <input type="date" className={input} value={data.startDate} min={new Date().toISOString().slice(0, 10)} disabled={data.flexible} onChange={(e) => set("startDate", e.target.value)} />
            </label>
            <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" className="size-5" checked={data.flexible} onChange={(e) => set("flexible", e.target.checked)} /> My dates are flexible
            </label>
            {err("startDate")}
          </div>
          <label className="block text-sm font-medium text-heading">Nights
            <select className={input} value={data.nights} onChange={(e) => set("nights", e.target.value)}>
              {nightOptions.map((n) => <option key={n} value={n}>{n} nights</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-heading">Adults
            <input type="number" inputMode="numeric" min={1} max={20} className={input} value={data.adults} onChange={(e) => set("adults", Number(e.target.value))} />
            {err("adults")}
          </label>
          <label className="block text-sm font-medium text-heading">Children
            <input type="number" inputMode="numeric" min={0} max={20} className={input} value={data.children} onChange={(e) => set("children", Number(e.target.value))} />
            {err("children")}
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-heading">Travel style (pick any)</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Travel style">
            {styleOptions.map((s) => <Chip key={s} on={data.styles.includes(s)} onClick={() => toggle("styles", s)}>{s}</Chip>)}
          </div>
          <label className="mt-5 block text-sm font-medium text-heading">Budget per person
            <select className={input} value={data.budget} onChange={(e) => set("budget", e.target.value)}>
              <option value="">Select a range</option>
              {budgets.map((b) => <option key={b}>{b}</option>)}
            </select>
            {err("budget")}
          </label>
          <label className="mt-5 block text-sm font-medium text-heading">Anything else we should know? (optional)
            <textarea rows={3} maxLength={1000} className={`${input} py-2`} value={data.message} onChange={(e) => set("message", e.target.value)} />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-heading">Full name
            <input autoComplete="name" className={input} value={data.name} onChange={(e) => set("name", e.target.value)} />
            {err("name")}
          </label>
          <label className="block text-sm font-medium text-heading">Phone
            <input type="tel" autoComplete="tel" className={input} value={data.phone} onChange={(e) => set("phone", e.target.value)} />
            {err("phone")}
          </label>
          <label className="block text-sm font-medium text-heading">Email
            <input type="email" autoComplete="email" className={input} value={data.email} onChange={(e) => set("email", e.target.value)} />
            {err("email")}
          </label>
          <label className="block text-sm font-medium text-heading">Preferred contact
            <select className={input} value={data.contactVia} onChange={(e) => set("contactVia", e.target.value as Enquiry["contactVia"])}>
              <option>WhatsApp</option><option>Phone</option><option>Email</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 size-5 shrink-0" checked={data.consent} onChange={(e) => set("consent", e.target.checked)} />
              I agree that MyTourbee may contact me about this trip request.
            </label>
            {err("consent")}
          </div>
        </div>
      )}

      {serverError && <p role="alert" className="mt-4 text-sm text-discount">{serverError}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button type="button" onClick={() => { setErrors({}); setStep((s) => (s - 1) as 1 | 2 | 3); }} className="min-h-12 rounded-full border border-primary px-6 text-sm font-semibold text-primary">Back</button>
        ) : <span />}
        <button disabled={busy} className="min-h-12 rounded-full bg-accent px-8 text-sm font-semibold text-heading hover:brightness-95 disabled:opacity-60">
          {step === 4 ? (busy ? "Sending…" : "Get My Quote") : "Next"}
        </button>
      </div>
    </form>
  );
}
