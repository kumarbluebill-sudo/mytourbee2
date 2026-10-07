import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/account/PrintButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { getSession } from "@/lib/auth";
import { fmtDate, inr, kindLabel, tripHref } from "@/lib/format";
import { getBookingFor } from "@/lib/store/records";

export const metadata: Metadata = { title: "My Booking | MyTourbee", robots: { index: false } };

export default async function BookingDetail({ params }: PageProps<"/account/trips/[id]">) {
  const { id } = await params;
  const s = (await getSession())!;
  const b = getBookingFor(id, s.ident);
  if (!b) notFound();

  const steps = [["Request received", true], ["Confirmed by our team", ["confirmed", "completed"].includes(b.status)], ["Paid", b.payment === "paid"], ["Trip completed", b.status === "completed"]] as const;
  const rows: [string, string][] = [
    ["Reference", b.id], ["Lead traveller", b.data.name], ["Date", fmtDate(b.travelDate)],
    ["Travellers", `${b.data.adults} adult${b.data.adults === 1 ? "" : "s"}${b.data.children ? `, ${b.data.children} child${b.data.children === 1 ? "" : "ren"}` : ""}`],
    ...(b.data.option ? [["Option", b.data.option] as [string, string]] : []),
    ["Contact", `${b.email} · ${b.phone}`], ["Booked on", fmtDate(b.createdAt)],
  ];

  return (
    <div className="max-w-3xl">
      <Link href="/account/trips" className="text-sm hover:text-primary print:hidden">← My Trips</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-2xl md:text-3xl">{b.title}</h2>
        <div className="flex gap-2"><StatusBadge value={b.status} /><StatusBadge value={b.payment} /></div>
      </div>

      {b.status === "cancelled" ? (
        <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-900">This booking was cancelled.</p>
      ) : (
        <ol className="mt-6 grid gap-3 sm:grid-cols-4">
          {steps.map(([l, done]) => (
            <li key={l} className={`rounded-2xl border p-4 text-sm ${done ? "border-success bg-green-50 text-heading" : "border-line"}`}>{done ? "✓ " : ""}{l}</li>
          ))}
        </ol>
      )}

      <dl className="mt-6 divide-y divide-line rounded-2xl border border-line">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 p-4"><dt>{k}</dt><dd className="text-right font-medium text-heading">{v}</dd></div>)}
        <div className="flex justify-between gap-4 p-4 text-lg"><dt className="font-bold text-heading">Total</dt><dd className="font-bold text-heading">{inr(b.total)}</dd></div>
      </dl>
      {b.data.notes && <p className="mt-4 text-sm"><span className="font-semibold text-heading">Your notes:</span> {b.data.notes}</p>}
      {b.note && <p className="mt-4 rounded-2xl bg-surface p-4 text-sm"><span className="font-semibold text-heading">Message from MyTourbee:</span> {b.note}</p>}

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <Link href={tripHref(b.kind, b.slug)} className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">View {kindLabel(b.kind)}</Link>
        <Link href="/contact" className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">Contact support</Link>
        {["confirmed", "completed"].includes(b.status) && <PrintButton />}
      </div>
    </div>
  );
}
