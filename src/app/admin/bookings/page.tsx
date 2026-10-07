import RecordControls from "@/components/admin/RecordControls";
import StatusBadge from "@/components/ui/StatusBadge";
import { fmtDate, inr } from "@/lib/format";
import { BOOKING_STATUSES, listBookings, PAYMENT_STATUSES } from "@/lib/store/records";

export default async function AdminBookings() {
  const list = listBookings();
  return (
    <div>
      <h1 className="text-3xl">Bookings</h1>
      <p className="mt-1">{list.length} total. Set a booking to Confirmed once availability is checked, and Paid after the payment arrives.</p>
      <ul className="mt-6 space-y-4">
        {list.map((b) => (
          <li key={b.id} className="rounded-2xl border border-line p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-heading">{b.title} {b.data.option && <span className="font-normal">({b.data.option})</span>}</p>
                <p className="text-sm">{b.id} · received {fmtDate(b.createdAt)}</p>
              </div>
              <div className="flex gap-2"><StatusBadge value={b.status} /><StatusBadge value={b.payment} /></div>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div><dt className="inline font-medium text-heading">Lead traveller: </dt><dd className="inline">{b.data.name}</dd></div>
              <div><dt className="inline font-medium text-heading">Contact: </dt><dd className="inline"><a className="text-primary" href={`mailto:${b.email}`}>{b.email}</a> · <a className="text-primary" href={`tel:${b.phone}`}>{b.phone}</a></dd></div>
              <div><dt className="inline font-medium text-heading">Date: </dt><dd className="inline">{fmtDate(b.travelDate)}</dd></div>
              <div><dt className="inline font-medium text-heading">Travellers: </dt><dd className="inline">{b.data.adults} adults, {b.data.children} children</dd></div>
              <div><dt className="inline font-medium text-heading">Total: </dt><dd className="inline font-bold text-heading">{inr(b.total)}</dd></div>
              <div><dt className="inline font-medium text-heading">Account: </dt><dd className="inline">{b.owner ?? "guest"}</dd></div>
            </dl>
            {b.data.notes && <p className="mt-2 rounded-xl bg-surface p-3 text-sm">{b.data.notes}</p>}
            <RecordControls type="bookings" id={b.id} status={b.status} statuses={BOOKING_STATUSES} payment={b.payment} payments={PAYMENT_STATUSES} note={b.note} />
          </li>
        ))}
        {list.length === 0 && <li className="rounded-2xl bg-surface p-8 text-center">No bookings yet.</li>}
      </ul>
    </div>
  );
}
