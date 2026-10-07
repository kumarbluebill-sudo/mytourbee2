"use client";

import { useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

const input = "mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";

export default function ProfileForm({ initial }: { initial: { name: string; email: string; phone: string; loginMethod: "email" | "mobile" } }) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const err = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-discount">{errors[k]}</p> : null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(""); setErrors({});
    try {
      const res = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.name, email: f.email, phone: f.phone }) });
      const j = await res.json().catch(() => ({}));
      if (res.ok) setMsg("Profile saved.");
      else if (res.status === 422 && j.errors) setErrors(j.errors);
      else setMsg("Could not save. Please try again.");
    } catch {
      setMsg("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="grid max-w-2xl gap-5 rounded-3xl border border-line bg-white p-5 sm:grid-cols-2 md:p-8">
      <label className="block text-sm font-medium text-heading sm:col-span-2">Full name
        <input autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} />{err("name")}
      </label>
      <label className="block text-sm font-medium text-heading">Email
        <input type="email" autoComplete="email" value={f.email} readOnly={f.loginMethod === "email"} onChange={(e) => setF({ ...f, email: e.target.value })} className={`${input} read-only:bg-surface`} />
        {f.loginMethod === "email" && <span className="mt-1 block text-xs font-normal">This is your sign-in email.</span>}{err("email")}
      </label>
      <label className="block text-sm font-medium text-heading">Mobile
        <input type="tel" autoComplete="tel" value={f.phone} readOnly={f.loginMethod === "mobile"} onChange={(e) => setF({ ...f, phone: e.target.value })} className={`${input} read-only:bg-surface`} />
        {f.loginMethod === "mobile" && <span className="mt-1 block text-xs font-normal">This is your sign-in number.</span>}{err("phone")}
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={busy} className="min-h-12 rounded-full bg-primary px-8 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">{busy ? "Saving…" : "Save profile"}</button>
        <LogoutButton />
        {msg && <span role="status" className="text-sm">{msg}</span>}
      </div>
    </form>
  );
}
