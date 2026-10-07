import type { Metadata } from "next";
import Link from "next/link";
import CruiseCard from "@/components/cards/CruiseCard";
import { cruiseLines } from "@/data/cruises";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Cruise Holidays | MyTourbee",
  description: "Compare cruises from Cordelia, MSC, Royal Caribbean, Disney and more. Choose your ship, route, dates and cabin.",
  alternates: { canonical: "/cruises" },
};

const sorts = [["popular", "Popular"], ["price-asc", "Price Low → High"], ["price-desc", "Price High → Low"], ["nights", "Shortest first"]] as const;
const durations = [["", "Any"], ["short", "Up to 4 nights"], ["mid", "5–7 nights"], ["long", "8+ nights"]] as const;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const field = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";

export default async function CruisesPage({ searchParams }: PageProps<"/cruises">) {
  const sp = await searchParams;
  const f = { line: one(sp.line), duration: one(sp.duration), sort: one(sp.sort) || "popular" };
  const all = await productService.getCruises();

  const list = all
    .filter((c) => !f.line || c.line === f.line)
    .filter((c) => (f.duration === "short" ? c.nights <= 4 : f.duration === "mid" ? c.nights >= 5 && c.nights <= 7 : f.duration === "long" ? c.nights >= 8 : true))
    .sort((a, b) => (f.sort === "price-asc" ? a.price - b.price : f.sort === "price-desc" ? b.price - a.price : f.sort === "nights" ? a.nights - b.nights : b.reviews - a.reviews));

  const lineHref = (l: string) => (l ? `/cruises?line=${encodeURIComponent(l)}` : "/cruises");

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link> &gt; Cruises</nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">🚢 Cruises</h1>
          <p className="mt-2 max-w-xl text-white/85 md:text-lg">Sail with the world&apos;s best cruise lines. {list.length} {list.length === 1 ? "cruise" : "cruises"}.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {[["", "All lines"], ...cruiseLines.map((l) => [l, l])].map(([v, l]) => (
            <Link key={l} href={lineHref(v)} aria-current={f.line === v ? "true" : undefined}
              className={`flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium ${f.line === v ? "border-primary bg-primary text-white" : "border-line bg-white text-heading hover:border-primary"}`}>{l}</Link>
          ))}
        </div>

        <form method="get" action="/cruises" className="mt-6 rounded-2xl border border-line bg-surface p-4">
          {f.line && <input type="hidden" name="line" value={f.line} />}
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-heading">Duration
              <select name="duration" defaultValue={f.duration} className={`${field} mt-1`}>{durations.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="text-sm font-medium text-heading">Sort by
              <select name="sort" defaultValue={f.sort} className={`${field} mt-1`}>{sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <div className="flex items-end gap-3">
              <button className="min-h-11 flex-1 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">Apply</button>
              <Link href="/cruises" className="flex min-h-11 items-center px-2 text-sm font-semibold text-primary">Clear</Link>
            </div>
          </div>
        </form>

        {list.length ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((c) => <CruiseCard key={c.slug} c={c} />)}</div>
        ) : (
          <div className="mt-12 rounded-3xl bg-surface p-10 text-center">
            <h2 className="text-2xl">No cruises match these filters</h2>
            <p className="mt-2">Clear a filter or ask our experts to find a cruise for you.</p>
            <Link href="/custom-trip" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">Create My Trip</Link>
          </div>
        )}
      </div>
    </>
  );
}
