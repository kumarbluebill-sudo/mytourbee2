import type { Metadata } from "next";
import ReviewForm from "@/components/account/ReviewForm";
import StatusBadge from "@/components/ui/StatusBadge";
import { getSession } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { listBookingsFor, listReviewsFor } from "@/lib/store/records";

export const metadata: Metadata = { title: "My Reviews | MyTourbee", robots: { index: false } };

export default async function ReviewsPage() {
  const s = (await getSession())!;
  const mine = listReviewsFor(s.ident);
  const reviewed = new Set(mine.map((r) => r.bookingId));
  const toReview = listBookingsFor(s.ident).filter((b) => b.status === "completed" && !reviewed.has(b.id));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl">Share your experience</h2>
        {toReview.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-surface p-6">After a trip is marked completed you can review it here.</p>
        ) : (
          <ul className="mt-4 space-y-4">{toReview.map((b) => <li key={b.id} className="rounded-2xl border border-line p-5"><ReviewForm bookingId={b.id} title={b.title} /></li>)}</ul>
        )}
      </section>
      {mine.length > 0 && (
        <section>
          <h2 className="text-2xl">Your reviews</h2>
          <ul className="mt-4 space-y-3">
            {mine.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-heading">{r.title}</p><StatusBadge value={r.status} /></div>
                <p className="mt-1 text-accent" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                <p className="mt-1">{r.text}</p>
                <p className="mt-2 text-xs">{fmtDate(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
