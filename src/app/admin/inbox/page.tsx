import RecordControls from "@/components/admin/RecordControls";
import StatusBadge from "@/components/ui/StatusBadge";
import { fmtDate } from "@/lib/format";
import { listMessages, listSubscribers, MESSAGE_STATUSES } from "@/lib/store/records";

export default async function AdminInbox() {
  const messages = listMessages();
  const subs = listSubscribers();
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl">Inbox</h1>
        <p className="mt-1">Messages from the Contact page.</p>
        <ul className="mt-6 space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="rounded-2xl border border-line p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-semibold text-heading">{m.subject}</p><p className="text-sm">{m.name} · <a className="text-primary" href={`mailto:${m.email}`}>{m.email}</a>{m.phone && <> · <a className="text-primary" href={`tel:${m.phone}`}>{m.phone}</a></>} · {fmtDate(m.createdAt)}</p></div>
                <StatusBadge value={m.status} />
              </div>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-surface p-3 text-sm">{m.body}</p>
              <RecordControls type="messages" id={m.id} status={m.status} statuses={MESSAGE_STATUSES} />
            </li>
          ))}
          {messages.length === 0 && <li className="rounded-2xl bg-surface p-8 text-center">No messages yet.</li>}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl">Newsletter subscribers ({subs.length})</h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line text-sm">
          {subs.map((s) => <li key={s.email} className="flex justify-between gap-3 px-4 py-3"><span>{s.email}</span><span>{fmtDate(s.createdAt)}</span></li>)}
          {subs.length === 0 && <li className="px-4 py-3">No subscribers yet.</li>}
        </ul>
      </section>
    </div>
  );
}
