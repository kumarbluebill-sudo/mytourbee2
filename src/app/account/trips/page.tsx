import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { getSession } from "@/lib/auth";
import { fmtDate, inr } from "@/lib/format";
import { listBookingsFor, listEnquiriesFor } from "@/lib/store/records";

export const metadata: Metadata = { title: "My Trips | MyTourbee", robots: { index: false } };

export default async function TripsPage() {
  const s = (await getSession())!;
  const bookings = listBookingsFor(s.ident);
  const enquiries = listEnquiriesFor(s.ident);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-surface p-6">No bookings yet. <Link href="/tours" className="font-semibold text-primary">Browse tours</Link> or <Link href="/things-to-do" className="font-semibold text-primary">things to do</Link>.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {bookings.map((b) => (
              <li key={b.id}>
                <Link href={`/account/trips/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-5 hover:shadow-md">
                  <div>
                    <p className="font-semibold text-heading">{b.title}</p>
                    <p className="text-sm">{fmtDate(b.travelDate)} · {b.travellers} {b.travellers === 1 ? "traveller" : "travellers"} · {b.id}</p>
                  </div>
                  <div className="flex items-center gap-3"><StatusBadge value={b.status} /><span className="font-bold text-heading">{inr(b.total)}</span></div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl">Custom trip requests</h2>
        {enquiries.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-surface p-6">No requests yet. <Link href="/custom-trip" className="font-semibold text-primary">Create My Trip</Link>.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {enquiries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-5">
                <div>
                  <p className="font-semibold text-heading">{[...e.data.destinations, e.data.otherPlace].filter(Boolean).join(", ")}</p>
                  <p className="text-sm">{e.data.flexible ? "Flexible dates" : fmtDate(e.data.startDate)} · {e.data.nights} nights · {e.data.adults + e.data.children} travellers · {e.id}</p>
                </div>
                <StatusBadge value={e.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
