import type { Metadata } from "next";
import Link from "next/link";
import DestinationCard from "@/components/cards/DestinationCard";
import { regions } from "@/data/destinations";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Destinations | MyTourbee",
  description: "Explore tours and experiences across India, Asia, the Middle East, Europe and Australia with MyTourbee.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const all = await productService.getAllDestinations();

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">Home</Link> &gt; Destinations
          </nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">Destinations</h1>
          <p className="mt-2 max-w-xl text-white/85 md:text-lg">
            {all.length} places to explore. Pick a region and find your next trip.
          </p>
          <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {regions.map((r) => (
              <a
                key={r} href={`#${r.replace(/\s/g, "-").toLowerCase()}`}
                className="flex min-h-11 shrink-0 items-center rounded-full bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/20"
              >
                {r}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        {regions.map((r) => {
          const items = all.filter((d) => d.region === r);
          if (!items.length) return null;
          return (
            <section key={r} id={r.replace(/\s/g, "-").toLowerCase()} className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl">{r}</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {items.map((d) => <DestinationCard key={d.slug} d={d} />)}
              </div>
            </section>
          );
        })}

        <section className="rounded-3xl bg-surface p-8 text-center md:p-12">
          <h2 className="text-2xl md:text-3xl">Don&apos;t see your destination?</h2>
          <p className="mt-2">More places are on the way. Tell us where you want to go and we will plan it.</p>
          <Link href="/custom-trip" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">
            Create My Trip
          </Link>
        </section>
      </div>
    </>
  );
}
