import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import ActivityCard from "@/components/cards/ActivityCard";
import CruiseCard from "@/components/cards/CruiseCard";
import DestinationCard from "@/components/cards/DestinationCard";
import PackageCard from "@/components/cards/PackageCard";
import { trendingSearches } from "@/data/mytourbee";
import { inr } from "@/lib/format";
import { productService } from "@/lib/services";

export const metadata: Metadata = { title: "Search | MyTourbee", robots: { index: false } };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const TABS = [["all", "All"], ["tours", "Tours"], ["things", "Things To Do"], ["cruises", "Cruises"], ["visas", "Visa"], ["destinations", "Destinations"], ["guides", "Travel Guides"]] as const;

function matcher(q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
  return (...fields: (string | undefined)[]) => {
    const hay = fields.join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const tab = TABS.some(([v]) => v === one(sp.tab)) ? one(sp.tab) : "all";

  const [dests, tours, acts, posts, cruiseList, visaList] = await Promise.all([
    productService.getAllDestinations(), productService.getTours(), productService.getActivities(), productService.getPosts(),
    productService.getCruises(), productService.getVisas(),
  ]);
  const name = new Map(dests.map((d) => [d.slug, d.name]));
  const m = matcher(q);

  const r = q
    ? {
        destinations: dests.filter((d) => m(d.name, d.region, d.overview)),
        tours: tours.filter((t) => m(t.title, name.get(t.destination), t.type, t.summary)),
        things: acts.filter((a) => m(a.title, name.get(a.destination), a.category, a.summary)),
        guides: posts.filter((p) => m(p.title, p.excerpt)),
        cruises: cruiseList.filter((c) => m(c.title, c.line, c.ship, c.route, c.summary)),
        visas: visaList.filter((v) => m(v.country, v.title, v.type)),
      }
    : { destinations: [], tours: [], things: [], guides: [], cruises: [], visas: [] };
  const counts = { all: r.destinations.length + r.tours.length + r.things.length + r.guides.length + r.cruises.length + r.visas.length, tours: r.tours.length, things: r.things.length, cruises: r.cruises.length, visas: r.visas.length, destinations: r.destinations.length, guides: r.guides.length };
  const show = (k: string) => tab === "all" || tab === k;
  const href = (t: string) => `/search?q=${encodeURIComponent(q)}${t === "all" ? "" : `&tab=${t}`}`;

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <h1 className="text-3xl !text-white md:text-4xl">{q ? `Results for “${q}”` : "Search MyTourbee"}</h1>
          <form action="/search" className="mt-5 flex gap-2 rounded-full bg-white p-2 pl-5">
            <label className="flex flex-1 items-center gap-3">
              <Search size={20} className="shrink-0" /><span className="sr-only">Search</span>
              <input name="q" defaultValue={q} type="search" placeholder="Destination, activity or experience" className="min-h-11 w-full bg-transparent text-heading outline-none" />
            </label>
            <button className="min-h-11 rounded-full bg-primary px-6 font-semibold text-white hover:bg-primary-dark">Search</button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {!q && (
          <div>
            <p className="font-medium text-heading">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trendingSearches.map((t) => <Link key={t} href={`/search?q=${t}`} className="flex min-h-11 items-center rounded-full border border-line px-5 text-sm hover:border-primary">{t}</Link>)}
            </div>
          </div>
        )}

        {q && (
          <>
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Result types">
              {TABS.map(([v, l]) => (
                <Link key={v} href={href(v)} role="tab" aria-selected={tab === v} className={`flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium ${tab === v ? "border-primary bg-primary text-white" : "border-line text-heading hover:border-primary"}`}>
                  {l} ({counts[v]})
                </Link>
              ))}
            </div>

            {counts.all === 0 && (
              <div className="mt-10 rounded-3xl bg-surface p-10 text-center">
                <h2 className="text-2xl">No results for “{q}”</h2>
                <p className="mt-2">Check the spelling, try a broader word, or let our experts plan it for you.</p>
                <Link href="/custom-trip" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">Create My Trip</Link>
              </div>
            )}

            <div className="mt-8 space-y-12">
              {show("destinations") && r.destinations.length > 0 && (
                <section><h2 className="text-2xl">Destinations</h2>
                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">{r.destinations.map((d) => <DestinationCard key={d.slug} d={d} />)}</div></section>
              )}
              {show("tours") && r.tours.length > 0 && (
                <section><h2 className="text-2xl">Tours <span className="text-base font-normal">{r.tours.length} results</span></h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{r.tours.map((t) => <PackageCard key={t.slug} p={t} />)}</div></section>
              )}
              {show("things") && r.things.length > 0 && (
                <section><h2 className="text-2xl">Things To Do <span className="text-base font-normal">{r.things.length} results</span></h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{r.things.map((a) => <ActivityCard key={a.slug} a={a} />)}</div></section>
              )}
              {show("cruises") && r.cruises.length > 0 && (
                <section><h2 className="text-2xl">Cruises <span className="text-base font-normal">{r.cruises.length} results</span></h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{r.cruises.map((c) => <CruiseCard key={c.slug} c={c} />)}</div></section>
              )}
              {show("visas") && r.visas.length > 0 && (
                <section><h2 className="text-2xl">Visa services</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {r.visas.map((v) => <li key={v.slug}><Link href={`/visa/${v.slug}`} className="block rounded-2xl border border-line p-5 hover:shadow-md"><p className="font-semibold text-heading">🛂 {v.title}</p><p className="mt-1 text-sm">{v.processing} · from {inr(v.price)}</p></Link></li>)}
                  </ul></section>
              )}
              {show("guides") && r.guides.length > 0 && (
                <section><h2 className="text-2xl">Travel Guides</h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {r.guides.map((p) => (
                      <Link key={p.slug} href={`/guide/${p.slug}`} className="group block">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src={p.image} alt="" fill sizes="(min-width:768px) 25vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                        <h3 className="mt-3 text-lg">{p.title}</h3>
                      </Link>
                    ))}
                  </div></section>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
