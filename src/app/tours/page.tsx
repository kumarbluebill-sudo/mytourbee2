import type { Metadata } from "next";
import Link from "next/link";
import PackageCard from "@/components/cards/PackageCard";
import { travelTypes } from "@/data/tours";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Tour Packages | MyTourbee",
  description: "Browse domestic and international tour packages. Filter by destination, duration, budget and travel style.",
  alternates: { canonical: "/tours" },
};

const sorts = [["popular", "Popular"], ["price-asc", "Price Low → High"], ["price-desc", "Price High → Low"], ["rating", "Rating"]] as const;
const durations = [["", "Any"], ["short", "1–4 nights"], ["mid", "5–6 nights"], ["long", "7+ nights"]] as const;
const budgets = [["", "Any"], ["30000", "Under ₹30,000"], ["60000", "Under ₹60,000"], ["100000", "Under ₹1,00,000"]] as const;
const scopes = [["", "All"], ["domestic", "Domestic"], ["international", "International"]] as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const field = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";

export default async function ToursPage({ searchParams }: PageProps<"/tours">) {
  const sp = await searchParams;
  const f = {
    destination: one(sp.destination), scope: one(sp.scope), duration: one(sp.duration),
    budget: one(sp.budget), type: one(sp.type), rating: one(sp.rating), sort: one(sp.sort) || "popular",
  };

  const [tours, destinations] = await Promise.all([productService.getTours(), productService.getAllDestinations()]);
  const region = new Map(destinations.map((d) => [d.slug, d]));

  let list = tours.filter((t) => {
    const d = region.get(t.destination);
    if (f.destination && t.destination !== f.destination) return false;
    if (f.scope === "domestic" && d?.region !== "India") return false;
    if (f.scope === "international" && d?.region === "India") return false;
    if (f.duration === "short" && t.nights > 4) return false;
    if (f.duration === "mid" && (t.nights < 5 || t.nights > 6)) return false;
    if (f.duration === "long" && t.nights < 7) return false;
    if (f.budget && t.price > Number(f.budget)) return false;
    if (f.type && t.type !== f.type) return false;
    if (f.rating && t.rating < Number(f.rating)) return false;
    return true;
  });
  list = [...list].sort((a, b) =>
    f.sort === "price-asc" ? a.price - b.price
    : f.sort === "price-desc" ? b.price - a.price
    : f.sort === "rating" ? b.rating - a.rating
    : b.reviews - a.reviews,
  );

  const destName = f.destination ? region.get(f.destination)?.name : "";
  const heading = destName ? `${destName} Tours` : f.scope === "domestic" ? "Domestic Tours" : f.scope === "international" ? "International Tours" : "Tour Packages";

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">Home</Link> &gt; Tours
          </nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">{heading}</h1>
          <p className="mt-2 text-white/85">{list.length} {list.length === 1 ? "package" : "packages"}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <form method="get" action="/tours" className="rounded-2xl border border-line bg-surface p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-heading">Destination
              <select name="destination" defaultValue={f.destination} className={`${field} mt-1`}>
                <option value="">All destinations</option>
                {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Region
              <select name="scope" defaultValue={f.scope} className={`${field} mt-1`}>
                {scopes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Duration
              <select name="duration" defaultValue={f.duration} className={`${field} mt-1`}>
                {durations.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Budget
              <select name="budget" defaultValue={f.budget} className={`${field} mt-1`}>
                {budgets.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Travel type
              <select name="type" defaultValue={f.type} className={`${field} mt-1`}>
                <option value="">Any</option>
                {travelTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Rating
              <select name="rating" defaultValue={f.rating} className={`${field} mt-1`}>
                <option value="">Any</option><option value="4.5">4.5+</option><option value="4.7">4.7+</option><option value="4.8">4.8+</option>
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Sort by
              <select name="sort" defaultValue={f.sort} className={`${field} mt-1`}>
                {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <div className="flex items-end gap-3">
              <button className="min-h-11 flex-1 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">Apply</button>
              <Link href="/tours" className="flex min-h-11 items-center px-2 text-sm font-semibold text-primary">Clear</Link>
            </div>
          </div>
        </form>

        {list.length ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((t) => <PackageCard key={t.slug} p={t} />)}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl bg-surface p-10 text-center">
            <h2 className="text-2xl">No packages match these filters</h2>
            <p className="mt-2">Try clearing a filter, or let our experts build a trip for you.</p>
            <Link href="/custom-trip" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">Create My Trip</Link>
          </div>
        )}
      </div>
    </>
  );
}
