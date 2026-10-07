"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy"); setError("");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, website }) });
      if (res.ok) { setState("done"); return; }
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Network problem. Please try again.");
    }
    setState("idle");
  }

  if (state === "done") return <p role="status" className="mt-6 rounded-2xl bg-white p-5 text-heading">Thank you! You&apos;re on the list.</p>;

  return (
    <form onSubmit={submit} noValidate className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <input
            type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="min-h-12 w-full rounded-full border border-line bg-white px-5 text-heading"
          />
        </label>
        <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <button disabled={state === "busy"} className="min-h-12 rounded-full bg-primary px-8 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {state === "busy" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-discount">{error}</p>}
    </form>
  );
}
