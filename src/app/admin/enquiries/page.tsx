import RecordControls from "@/components/admin/RecordControls";
import StatusBadge from "@/components/ui/StatusBadge";
import { fmtDate } from "@/lib/format";
import { ENQUIRY_STATUSES, listEnquiries } from "@/lib/store/records";

export default async function AdminEnquiries() {
  const list = listEnquiries();
  return (
    <div>
      <h1 className="text-3xl">Custom trip enquiries</h1>
      <p className="mt-1">{list.length} total</p>
      <ul className="mt-6 space-y-4">
        {list.map((e) => (
          <li key={e.id} className="rounded-2xl border border-line p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-heading">{e.data.name} · {[...e.data.destinations, e.data.otherPlace].filter(Boolean).join(", ")}</p>
                <p className="text-sm">{e.id} · {fmtDate(e.createdAt)}</p>
              </div>
              <StatusBadge value={e.status} />
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div><dt className="inline font-medium text-heading">Contact: </dt><dd className="inline"><a className="text-primary" href={`mailto:${e.email}`}>{e.email}</a> · <a className="text-primary" href={`tel:${e.phone}`}>{e.phone}</a> ({e.data.contactVia})</dd></div>
              <div><dt className="inline font-medium text-heading">When: </dt><dd className="inline">{e.data.flexible ? "Flexible" : fmtDate(e.data.startDate)} · {e.data.nights} nights</dd></div>
              <div><dt className="inline font-medium text-heading">Travellers: </dt><dd className="inline">{e.data.adults} adults, {e.data.children} children</dd></div>
              <div><dt className="inline font-medium text-heading">Budget: </dt><dd className="inline">{e.data.budget}</dd></div>
              {e.data.styles.length > 0 && <div><dt className="inline font-medium text-heading">Style: </dt><dd className="inline">{e.data.styles.join(", ")}</dd></div>}
              {e.data.source && <div><dt className="inline font-medium text-heading">From: </dt><dd className="inline">{e.data.source}</dd></div>}
            </dl>
            {e.data.message && <p className="mt-2 rounded-xl bg-surface p-3 text-sm">{e.data.message}</p>}
            <RecordControls type="enquiries" id={e.id} status={e.status} statuses={ENQUIRY_STATUSES} note={e.note} />
          </li>
        ))}
        {list.length === 0 && <li className="rounded-2xl bg-surface p-8 text-center">No enquiries yet.</li>}
      </ul>
    </div>
  );
}
