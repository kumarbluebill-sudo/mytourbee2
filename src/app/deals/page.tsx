import type { Metadata } from "next";
import Link from "next/link";
import PackageCard from "@/components/cards/PackageCard";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Travel Deals & Offers | MyTourbee",
  description: "Flash deals and seasonal offers on tour packages. Save up to 25% on Dubai, Bali, Switzerland, Kerala and more.",
  alternates: { canonical: "/deals" },
};

const scopes = [["", "All deals"], ["domestic", "Domestic"], ["international", "International"]] as const;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const campaigns = [
  { emoji: "💕", title: "Honeymoon Specials", text: "Romantic escapes for two", href: "/tours?type=Honeymoon" },
  { emoji: "👨‍👩‍👧", title: "Family Holidays", text: "Fun for every age", href: "/tours?type=Family" },
  { emoji: "🏔️", title: "Adventure Trips", text: "For the thrill seekers", href: "/tours?type=Adventure" },
  { emoji: "⏱️", title: "Short Getaways", text: "Up to 4 nights", href: "/tours?duration=short" },
];

export default async function DealsPage({ searchParams }: PageProps<"/deals">) {
  const sp = await searchParams;
  const scope = one(sp.scope);
  const [tours, destinations] = await Promise.all([productService.getTours(), productService.getAllDestinations()]);
  const region = new Map(destinations.map((d) => [d.slug, d.region]));

  const deals = tours
    .filter((t) => t.discountPct > 0)
    .filter((t) => (scope === "domestic" ? region.get(t.destination) === "India" : scope === "international" ? region.get(t.destination) !== "India" : true))
    .sort((a, b) => b.discountPct - a.discountPct);
  const flash = deals.filter((t) => t.discountPct >= 20);
  const rest = deals.filter((t) => t.discountPct < 20);

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">Home</Link> &gt; Deals
          </nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">🔥 Unmissable Travel Deals</h1>
          <p className="mt-2 max-w-xl text-white/85 md:text-lg">Hand-picked offers on our most loved trips. Prices shown are already discounted.</p>
          <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {scopes.map(([v, l]) => (
              <Link
                key={l} href={v ? `/deals?scope=${v}` : "/deals"} aria-current={scope === v ? "true" : undefined}
                className={`flex min-h-11 shrink-0 items-center rounded-full px-5 text-sm font-medium ${scope === v ? "bg-accent text-heading" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        {deals.length === 0 && (
          <div className="rounded-3xl bg-surface p-10 text-center">
            <h2 className="text-2xl">No deals in this category right now</h2>
            <p className="mt-2">Check all deals or ask our experts for a custom quote.</p>
            <Link href="/deals" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">View all deals</Link>
          </div>
        )}

        {flash.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl">⚡ Flash Deals <span className="text-base font-normal text-body">20% off or more</span></h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {flash.map((t) => <PackageCard key={t.slug} p={t} />)}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl">More Offers</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {rest.map((t) => <PackageCard key={t.slug} p={t} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl md:text-3xl">Seasonal Campaigns</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {campaigns.map((c) => (
              <Link key={c.title} href={c.href} className="rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-md">
                <span className="text-3xl">{c.emoji}</span>
                <h3 className="mt-3 text-lg">{c.title}</h3>
                <p className="mt-1 text-sm">{c.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-primary-dark p-8 text-center md:p-12">
          <h2 className="text-2xl !text-white md:text-3xl">Can&apos;t find your deal?</h2>
          <p className="mt-2 text-white/85">Tell us your dates and budget and we will find the best price for you.</p>
          <Link href="/custom-trip" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">Get My Quote</Link>
        </section>
      </div>
    </>
  );
}
