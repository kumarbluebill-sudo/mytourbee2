import type { Metadata } from "next";
import Link from "next/link";
import ProfileForm from "@/components/account/ProfileForm";
import { getSession } from "@/lib/auth";
import { ensureUser, getUser, listBookingsFor, listEnquiriesFor } from "@/lib/store/records";

export const metadata: Metadata = { title: "My Account | MyTourbee", robots: { index: false } };

export default async function AccountPage() {
  const s = (await getSession())!; // layout guarantees a session
  ensureUser(s.ident, s.method);
  const u = getUser(s.ident)!;
  const bookings = listBookingsFor(s.ident);
  const enquiries = listEnquiriesFor(s.ident);
  const stats = [
    [bookings.length, "Bookings", "/account/trips"],
    [enquiries.length, "Trip requests", "/account/trips"],
    [bookings.filter((b) => b.status === "confirmed").length, "Confirmed", "/account/documents"],
  ] as const;

  return (
    <div className="space-y-8">
      <ul className="grid gap-4 sm:grid-cols-3">
        {stats.map(([n, l, h]) => (
          <li key={l}><Link href={h} className="block rounded-2xl border border-line p-5 hover:shadow-md"><p className="text-3xl font-bold text-heading">{n}</p><p className="text-sm">{l}</p></Link></li>
        ))}
      </ul>
      <section>
        <h2 className="mb-4 text-2xl">Profile</h2>
        <ProfileForm initial={{ name: u.name, email: u.email, phone: u.phone, loginMethod: s.method }} />
      </section>
    </div>
  );
}
