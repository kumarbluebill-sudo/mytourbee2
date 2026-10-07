import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin | MyTourbee", robots: { index: false, follow: false } };

const nav = [
  ["Dashboard", "/admin"],
  ["Tour packages", "/admin/c/tour"], ["Things To Do", "/admin/c/activity"], ["Cruises", "/admin/c/cruise"], ["Visa services", "/admin/c/visa"], ["Destinations", "/admin/c/destination"], ["Travel guides", "/admin/c/post"],
  ["Enquiries", "/admin/enquiries"], ["Bookings", "/admin/bookings"], ["Reviews", "/admin/reviews"], ["Inbox", "/admin/inbox"],
  ["Site settings", "/admin/settings"],
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const s = await getSession();
  if (!s) redirect("/login?next=/admin");
  if (!isAdmin(s)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl">No access</h1>
        <p className="mt-2">This account is not an administrator. Ask the site owner to add your email to the admin list.</p>
        <Link href="/account" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">Back to my account</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
      <nav aria-label="Admin" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
        {nav.map(([l, h]) => <Link key={h} href={h} className="flex min-h-11 shrink-0 items-center rounded-xl px-4 text-sm font-medium text-heading hover:bg-surface">{l}</Link>)}
        <Link href="/" className="flex min-h-11 shrink-0 items-center rounded-xl px-4 text-sm hover:bg-surface">← View website</Link>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
