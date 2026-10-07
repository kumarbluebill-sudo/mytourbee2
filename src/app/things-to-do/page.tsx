import type { Metadata } from "next";
import Link from "next/link";
import ActivityCard from "@/components/cards/ActivityCard";
import { activityCategoryList } from "@/data/activities";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Things To Do | MyTourbee",
  description: "Book attractions, theme parks, adventures, cruises, food experiences and more at the world's best destinations.",
  alternates: { canonical: "/things-to-do" },
};

const sorts = [["popular", "Popular"], ["price-asc", "Price Low → High"], ["price-desc", "Price High → Low"], ["rating", "Rating"]] as const;
const budgets = [["", "Any"], ["2000", "Under ₹2,000"], ["4000", "Under ₹4,000"], ["7000", "Under ₹7,000"]] as const;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const field = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";

export default async function ThingsToDoPage({ searchParams }: PageProps<"/things-to-do">) {
  const sp = await searchParams;
  const f = {
    category: one(sp.category), destination: one(sp.destination), budget: one(sp.budget),
    q: one(sp.q).trim(), sort: one(sp.sort) || "popular",
  };

  const [activities, destinations] = await Promise.all([productService.getActivities(), productService.getAllDestinations()]);
  const names = new Map(destinations.map((d) => [d.slug, d.name]));
  const q = f.q.toLowerCase();

  const list = activities
    .filter((a) => {
      if (f.category && a.category !== f.category) return false;
      if (f.destination && a.destination !== f.destination) return false;
      if (f.budget && a.price > Number(f.budget)) return false;
      if (q && !`${a.title} ${a.category} ${names.get(a.destination)}`.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) =>
      f.sort === "price-asc" ? a.price - b.price
      : f.sort === "price-desc" ? b.price - a.price
      : f.sort === "rating" ? b.rating - a.rating
      : b.reviews - a.reviews,
    );

  const place = f.destination ? names.get(f.destination) : "";
  const heading = place ? `Things To Do in ${place}` : f.category || "Things To Do";
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (f.destination) p.set("destination", f.destination);
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/things-to-do?${s}` : "/things-to-do";
  };

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">Home</Link> &gt; Things To Do
          </nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">{heading}</h1>
          <p className="mt-2 text-white/85">Make memories, not just itineraries. {list.length} {list.length === 1 ? "experience" : "experiences"}.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {[["", "All"], ...activityCategoryList.map((c) => [c, c])].map(([v, l]) => (
            <Link
              key={l} href={qs({ category: v })}
              aria-current={f.category === v ? "true" : undefined}
              className={`flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium ${
                f.category === v ? "border-primary bg-primary text-white" : "border-line bg-white text-heading hover:border-primary"
              }`}
            >
              {l}
            </Link>
          ))}
        </div>

        <form method="get" action="/things-to-do" className="mt-6 rounded-2xl border border-line bg-surface p-4">
          {f.category && <input type="hidden" name="category" value={f.category} />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-medium text-heading lg:col-span-2">Search
              <input name="q" defaultValue={f.q} placeholder="Activity, place or type" className={`${field} mt-1`} />
            </label>
            <label className="text-sm font-medium text-heading">Destination
              <select name="destination" defaultValue={f.destination} className={`${field} mt-1`}>
                <option value="">All destinations</option>
                {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Budget
              <select name="budget" defaultValue={f.budget} className={`${field} mt-1`}>
                {budgets.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-heading">Sort by
              <select name="sort" defaultValue={f.sort} className={`${field} mt-1`}>
                {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button className="min-h-11 rounded-full bg-primary px-8 text-sm font-semibold text-white hover:bg-primary-dark">Apply</button>
            <Link href="/things-to-do" className="flex min-h-11 items-center px-2 text-sm font-semibold text-primary">Clear</Link>
          </div>
        </form>

        {list.length ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((a) => <ActivityCard key={a.slug} a={a} />)}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl bg-surface p-10 text-center">
            <h2 className="text-2xl">No experiences match these filters</h2>
            <p className="mt-2">Try clearing a filter or searching for something else.</p>
            <Link href="/things-to-do" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">Clear filters</Link>
          </div>
        )}
      </div>
    </>
  );
}
