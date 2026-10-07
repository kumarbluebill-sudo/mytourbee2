import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { requireSession } from "@/lib/auth";
import { fmtDate, inr } from "@/lib/format";
import { listBookingsFor } from "@/lib/store/records";

export const metadata: Metadata = { title: "Payments | MyTourbee", robots: { index: false } };

export default async function PaymentsPage() {
  const s = await requireSession();
  const list = listBookingsFor(s.ident).filter((b) => b.status !== "cancelled" || b.payment !== "unpaid");
  const due = list.filter((b) => b.payment === "unpaid" && b.status !== "cancelled").reduce((n, b) => n + b.total, 0);
  const paid = list.filter((b) => b.payment === "paid").reduce((n, b) => n + b.total, 0);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line p-5"><p className="text-sm">Paid</p><p className="text-3xl font-bold text-heading">{inr(paid)}</p></div>
        <div className="rounded-2xl border border-line p-5"><p className="text-sm">Awaiting payment</p><p className="text-3xl font-bold text-heading">{inr(due)}</p></div>
      </div>
      <p className="mt-4 rounded-2xl bg-surface p-4 text-sm">Online payment is not switched on yet. When your booking is confirmed our team sends you a secure payment link and marks it paid here.</p>
      {list.length === 0 ? (
        <p className="mt-6">No payments yet. <Link href="/tours" className="font-semibold text-primary">Browse tours</Link>.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((b) => (
            <li key={b.id}>
              <Link href={`/account/trips/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-5 hover:shadow-md">
                <div><p className="font-semibold text-heading">{b.title}</p><p className="text-sm">{b.id} · booked {fmtDate(b.createdAt)}</p></div>
                <div className="flex items-center gap-3"><StatusBadge value={b.payment} /><span className="font-bold text-heading">{inr(b.total)}</span></div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
