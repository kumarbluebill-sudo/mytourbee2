import RecordControls from "@/components/admin/RecordControls";
import StatusBadge from "@/components/ui/StatusBadge";
import { fmtDate } from "@/lib/format";
import { listReviews, REVIEW_STATUSES } from "@/lib/store/records";

export default async function AdminReviews() {
  const list = listReviews();
  return (
    <div>
      <h1 className="text-3xl">Reviews</h1>
      <p className="mt-1">Only approved reviews appear on the website.</p>
      <ul className="mt-6 space-y-4">
        {list.map((r) => (
          <li key={r.id} className="rounded-2xl border border-line p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="font-semibold text-heading">{r.title}</p><p className="text-sm">{r.name}{r.city && `, ${r.city}`} · {fmtDate(r.createdAt)}</p></div>
              <StatusBadge value={r.status} />
            </div>
            <p className="mt-2 text-accent" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
            <p className="mt-1">{r.text}</p>
            <RecordControls type="reviews" id={r.id} status={r.status} statuses={REVIEW_STATUSES} />
          </li>
        ))}
        {list.length === 0 && <li className="rounded-2xl bg-surface p-8 text-center">No reviews yet. Customers can review a trip after you mark the booking Completed.</li>}
      </ul>
    </div>
  );
}
