"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewForm({ bookingId, title }: { bookingId: string; title: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/account/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, rating, text, city }) });
      const j = await res.json().catch(() => ({}));
      if (res.ok) { router.refresh(); return; }
      setError(j.error ?? "Could not submit your review.");
    } catch {
      setError("Network problem. Please try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} noValidate>
      <p className="font-semibold text-heading">{title}</p>
      <fieldset className="mt-2">
        <legend className="sr-only">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-pressed={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="size-11 text-2xl text-accent">{n <= rating ? "★" : "☆"}</button>
          ))}
        </div>
      </fieldset>
      <label className="mt-2 block text-sm font-medium text-heading">Your review
        <textarea rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-heading" />
      </label>
      <label className="mt-2 block text-sm font-medium text-heading">Your city (optional)
        <input value={city} maxLength={60} onChange={(e) => setCity(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-heading" />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-discount">{error}</p>}
      <button disabled={busy} className="mt-3 min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">{busy ? "Sending…" : "Submit review"}</button>
      <p className="mt-2 text-xs">Reviews are checked by our team before they appear on the site.</p>
    </form>
  );
}
