import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { listBookingsFor } from "@/lib/store/records";

export const metadata: Metadata = { title: "Documents | MyTourbee", robots: { index: false } };

export default async function DocumentsPage() {
  const s = await requireSession();
  const ready = listBookingsFor(s.ident).filter((b) => b.status === "confirmed" || b.status === "completed");

  return (
    <div>
      <h2 className="text-2xl">Booking confirmations</h2>
      {ready.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-surface p-6">Your confirmations appear here once our team confirms a booking.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {ready.map((b) => (
            <li key={b.id}>
              <Link href={`/account/trips/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-5 hover:shadow-md">
                <div><p className="font-semibold text-heading">📄 {b.title}</p><p className="text-sm">{b.id} · {fmtDate(b.travelDate)}</p></div>
                <span className="text-sm font-semibold text-primary">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
