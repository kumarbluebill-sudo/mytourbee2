"use client";

import Link from "next/link";
import { useState } from "react";

type Method = "email" | "mobile";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ()-]{8,16}$/;

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

export default function LoginForm({ next }: { next: string }) {
  const [method, setMethod] = useState<Method>("email");
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"contact" | "code">("contact");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dev, setDev] = useState(false);
  const [busy, setBusy] = useState(false);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setNotice("");
    const v = value.trim();
    if (!(method === "email" ? EMAIL.test(v) : PHONE.test(v))) {
      setError(method === "email" ? "Enter a valid email address." : "Enter a valid mobile number.");
      return;
    }
    setError(""); setBusy(true);
    try {
      const { status, json } = await post("/api/auth/request-code", { method, value: v });
      if (status === 200) { setStage("code"); setDev(!!json.dev); setCode(""); }
      else if (status === 501) setNotice("Online sign-in is not available yet. You can still enquire or book with help from our travel experts.");
      else if (status === 429) setError("Please wait 30 seconds before asking for another code.");
      else setError("Please check the details and try again.");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) { setError("Enter the 6-digit code."); return; }
    setError(""); setBusy(true);
    try {
      const { status } = await post("/api/auth/verify", { method, value: value.trim(), code: code.trim() });
      if (status === 200) { window.location.assign(next); return; }
      setError(status === 429 ? "Too many attempts. Request a new code." : status === 401 ? "That code is incorrect or has expired." : "Something went wrong. Please try again.");
    } catch {
      setError("Network problem. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl md:text-3xl">Welcome to MyTourbee</h1>
      <p className="mt-1 text-sm">Sign in or create your account. New here? We&apos;ll set you up automatically.</p>

      {stage === "contact" ? (
        <>
          <div role="tablist" aria-label="Sign-in method" className="mt-6 grid grid-cols-2 rounded-full bg-surface p-1">
            {(["email", "mobile"] as const).map((m) => (
              <button
                key={m} role="tab" aria-selected={method === m} type="button"
                onClick={() => { setMethod(m); setValue(""); setError(""); setNotice(""); }}
                className={`min-h-11 rounded-full text-sm font-semibold ${method === m ? "bg-white text-primary shadow-sm" : "text-body"}`}
              >
                {m === "email" ? "Continue with Email" : "Continue with Mobile"}
              </button>
            ))}
          </div>

          <form onSubmit={sendCode} noValidate className="mt-6">
            <label className="block text-sm font-medium text-heading">
              {method === "email" ? "Email address" : "Mobile number"}
              <input
                key={method}
                type={method === "email" ? "email" : "tel"}
                autoComplete={method === "email" ? "email" : "tel"}
                placeholder={method === "email" ? "you@example.com" : "+91 98765 43210"}
                value={value} onChange={(e) => setValue(e.target.value)}
                aria-invalid={!!error} aria-describedby={error ? "login-err" : undefined}
                className="mt-1 min-h-12 w-full rounded-xl border border-line px-4 text-heading"
              />
            </label>
            {error && <p id="login-err" role="alert" className="mt-2 text-sm text-discount">{error}</p>}
            <button disabled={busy} className="mt-5 min-h-12 w-full rounded-full bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {busy ? "Please wait…" : "Send code"}
            </button>
            {notice && <p role="status" className="mt-4 rounded-xl bg-surface p-4 text-sm">{notice} <Link href="/custom-trip" className="font-semibold text-primary">Plan a trip</Link></p>}
          </form>
        </>
      ) : (
        <form onSubmit={verify} noValidate className="mt-6">
          <p className="text-sm">We sent a 6-digit code to <span className="font-semibold text-heading">{value.trim()}</span>.</p>
          {dev && <p className="mt-2 rounded-xl bg-surface p-3 text-xs">Development mode: no email or SMS is sent. The code is printed in the terminal running <code>npm run dev</code>.</p>}
          <label className="mt-4 block text-sm font-medium text-heading">Verification code
            <input
              inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              aria-invalid={!!error} aria-describedby={error ? "login-err" : undefined}
              className="mt-1 min-h-12 w-full rounded-xl border border-line px-4 text-center text-xl tracking-[0.5em] text-heading"
            />
          </label>
          {error && <p id="login-err" role="alert" className="mt-2 text-sm text-discount">{error}</p>}
          <button disabled={busy} className="mt-5 min-h-12 w-full rounded-full bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {busy ? "Verifying…" : "Verify and continue"}
          </button>
          <div className="mt-3 flex justify-between text-sm">
            <button type="button" onClick={() => { setStage("contact"); setError(""); }} className="min-h-11 font-semibold text-primary">Change {method === "email" ? "email" : "number"}</button>
            <button type="button" onClick={() => sendCode()} disabled={busy} className="min-h-11 font-semibold text-primary">Resend code</button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-xs">
        By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
