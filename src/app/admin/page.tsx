import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { fmtDate, inr } from "@/lib/format";
import { listCatalog } from "@/lib/store/catalog";
import { listAudit, listBookings, listEnquiries, listMessages, listReviews, listSubscribers } from "@/lib/store/records";

export default async function AdminHome() {
  const s = await requireAdminSession();
  const enquiries = listEnquiries();
  const bookings = listBookings();
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const cards = [
    [enquiries.filter((e) => e.status === "new").length, "New enquiries", "/admin/enquiries"],
    [bookings.filter((b) => b.status === "pending").length, "Bookings to confirm", "/admin/bookings"],
    [enquiries.filter((e) => e.status === "quoted").length, "Quotes sent", "/admin/enquiries"],
    [inr(bookings.filter((b) => b.payment === "paid").reduce((n, b) => n + b.total, 0)), "Revenue (paid)", "/admin/bookings"],
    [inr(bookings.filter((b) => b.status !== "cancelled" && b.payment === "unpaid").reduce((n, b) => n + b.total, 0)), "Awaiting payment", "/admin/bookings"],
    [listReviews().filter((r) => r.status === "pending").length, "Reviews to approve", "/admin/reviews"],
    [listMessages().filter((m) => m.status === "new").length, "New messages", "/admin/inbox"],
    [listSubscribers().length, "Newsletter subscribers", "/admin/inbox"],
  ] as const;

  const counts = [
    ["Tour packages", listCatalog("tour").length, "/admin/c/tour"], ["Things To Do", listCatalog("activity").length, "/admin/c/activity"],
    ["Cruises", listCatalog("cruise").length, "/admin/c/cruise"], ["Visa services", listCatalog("visa").length, "/admin/c/visa"], ["Destinations", listCatalog("destination").length, "/admin/c/destination"], ["Travel guides", listCatalog("post").length, "/admin/c/post"],
  ] as const;

  return (
    <div className="space-y-10">
      <div><h1 className="text-3xl">{hello} 👋</h1><p className="mt-1">Today&apos;s overview for {s.ident}</p></div>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([n, l, h]) => (
          <li key={l}><Link href={h} className="block rounded-2xl border border-line p-5 hover:shadow-md"><p className="text-2xl font-bold text-heading md:text-3xl">{n}</p><p className="mt-1 text-sm">{l}</p></Link></li>
        ))}
      </ul>

      <section>
        <h2 className="text-xl">Content</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {counts.map(([l, n, h]) => <li key={l}><Link href={h} className="flex min-h-14 items-center justify-between rounded-2xl bg-surface px-5 hover:shadow-md"><span>{l}</span><span className="font-bold text-heading">{n}</span></Link></li>)}
        </ul>
      </section>

      <section>
        <h2 className="text-xl">Recent activity</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line text-sm">
          {listAudit(12).map((a, i) => <li key={i} className="flex flex-wrap justify-between gap-2 px-4 py-3"><span><span className="font-semibold capitalize text-heading">{a.action}</span> {a.target}</span><span>{a.actor} · {fmtDate(a.at)}</span></li>)}
          {listAudit(1).length === 0 && <li className="px-4 py-3">No changes yet.</li>}
        </ul>
      </section>
    </div>
  );
}
