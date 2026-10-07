"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const sel = "min-h-11 rounded-xl border border-line bg-white px-3 text-sm capitalize text-heading";

/** Status (and optional payment status / internal note) editor for one enquiry, booking, review or message. */
export default function RecordControls({ type, id, status, statuses, payment, payments, note }: {
  type: "enquiries" | "bookings" | "reviews" | "messages"; id: string; status: string; statuses: readonly string[];
  payment?: string; payments?: readonly string[]; note?: string;
}) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [p, setP] = useState(payment ?? "");
  const [n, setN] = useState(note ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const hasNote = note !== undefined;
  const dirty = s !== status || p !== (payment ?? "") || n !== (note ?? "");

  async function save() {
    setBusy(true); setMsg("");
    try {
      const res = await fetch(`/api/admin/records/${type}/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s, ...(payments ? { payment: p } : {}), ...(hasNote ? { note: n } : {}) }),
      });
      if (res.ok) { setMsg("Saved"); router.refresh(); } else setMsg((await res.json().catch(() => ({}))).error ?? "Could not save");
    } catch {
      setMsg("Network problem");
    }
    setBusy(false);
  }

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3">
      <label className="text-xs font-medium text-heading">Status
        <select value={s} onChange={(e) => setS(e.target.value)} className={`${sel} mt-1 block`}>{statuses.map((x) => <option key={x}>{x}</option>)}</select>
      </label>
      {payments && (
        <label className="text-xs font-medium text-heading">Payment
          <select value={p} onChange={(e) => setP(e.target.value)} className={`${sel} mt-1 block`}>{payments.map((x) => <option key={x}>{x}</option>)}</select>
        </label>
      )}
      {hasNote && (
        <label className="min-w-48 flex-1 text-xs font-medium text-heading">{type === "bookings" ? "Message shown to the customer" : "Internal note"}
          <input value={n} maxLength={2000} onChange={(e) => setN(e.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3 text-sm text-heading" />
        </label>
      )}
      <button onClick={save} disabled={busy || !dirty} className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Saving…" : "Save"}</button>
      {msg && <span role="status" className="text-sm">{msg}</span>}
    </div>
  );
}
