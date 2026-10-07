import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Anchor, Calendar, Check, MapPin, Ship, Star, X } from "lucide-react";
import CruiseCard from "@/components/cards/CruiseCard";
import Button from "@/components/ui/Button";
import Section, { CardRail } from "@/components/ui/Section";
import { fmtDate, inr } from "@/lib/format";
import { productService } from "@/lib/services";

export async function generateMetadata({ params }: PageProps<"/cruises/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await productService.getCruise(slug);
  if (!c) return {};
  return {
    title: c.metaTitle || `${c.title} | ${c.line} Cruise | MyTourbee`,
    description: c.metaDescription || c.summary,
    alternates: { canonical: `/cruises/${c.slug}` },
    openGraph: { title: c.title, description: c.summary, images: [c.gallery[0] ?? c.image] },
  };
}

export default async function CruisePage({ params }: PageProps<"/cruises/[slug]">) {
  const { slug } = await params;
  const c = await productService.getCruise(slug);
  if (!c) notFound();

  const [all, reviewList] = await Promise.all([productService.getCruises(), productService.getReviews(c.slug)]);
  const related = all.filter((x) => x.slug !== c.slug).slice(0, 4);
  const today = new Date().toISOString().slice(0, 10);
  const dates = c.departures.filter((d) => d.date >= today);
  const gallery = c.gallery.length ? c.gallery : [c.image];

  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: c.title, description: c.summary, image: gallery,
    aggregateRating: { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.reviews },
    offers: { "@type": "Offer", priceCurrency: "INR", price: c.price, availability: dates.length ? "https://schema.org/InStock" : "https://schema.org/SoldOut" },
  };

  const bookCard = (
    <form action="/booking" method="get" className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <input type="hidden" name="cruise" value={c.slug} />
      <p className="text-xs">From</p>
      <p className="text-3xl font-bold text-heading">{inr(c.price)}<span className="text-sm font-normal text-body"> / person</span></p>
      {dates.length ? (
        <>
          <label className="mt-4 block text-sm font-medium text-heading">Departure
            <select name="date" className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading">{dates.map((d) => <option key={d.date} value={d.date}>{fmtDate(d.date)}</option>)}</select>
          </label>
          <label className="mt-3 block text-sm font-medium text-heading">Cabin
            <select name="option" className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading">{c.cabins.map((o) => <option key={o.name} value={o.name}>{o.name} — {inr(o.price)}</option>)}</select>
          </label>
          <label className="mt-3 block text-sm font-medium text-heading">Guests
            <select name="guests" className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select>
          </label>
          <button className="mt-4 min-h-12 w-full rounded-full bg-primary font-semibold text-white hover:bg-primary-dark">Check Availability</button>
        </>
      ) : (
        <p className="mt-4 rounded-xl bg-surface p-3 text-sm">No upcoming departures are listed. Ask our experts about new dates.</p>
      )}
      <Link href={`/custom-trip?cruise=${c.slug}`} className="mt-3 flex min-h-11 items-center justify-center rounded-full border border-primary text-sm font-semibold text-primary">Ask an expert</Link>
    </form>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav aria-label="Breadcrumb" className="text-sm"><Link href="/cruises" className="hover:text-primary">Cruises</Link> &gt; <span className="text-heading">{c.title}</span></nav>

        <div className="mt-4 grid gap-2 md:grid-cols-4 md:grid-rows-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[360px]">
            <Image src={gallery[0]} alt={c.title} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          {gallery.slice(1, 5).map((g, i) => (
            <div key={g} className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl md:block"><Image src={g} alt={`${c.title} photo ${i + 2}`} fill sizes="25vw" className="object-cover" /></div>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl">{c.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 font-semibold text-heading"><Star size={16} className="fill-accent text-accent" />{c.rating}</span>
              <a href="#reviews" className="hover:text-primary">{c.reviews} Reviews</a>
              <span className="rounded-full bg-surface px-3 py-0.5 text-sm">{c.line}</span>
            </p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              <li className="flex items-start gap-3 rounded-2xl bg-surface p-4"><Ship className="mt-0.5 shrink-0 text-primary" size={20} /><span><span className="block text-xs">Ship</span><span className="font-semibold text-heading">{c.ship}</span></span></li>
              <li className="flex items-start gap-3 rounded-2xl bg-surface p-4"><Anchor className="mt-0.5 shrink-0 text-primary" size={20} /><span><span className="block text-xs">Departs from</span><span className="font-semibold text-heading">{c.departurePort} · {c.nights} nights</span></span></li>
              <li className="flex items-start gap-3 rounded-2xl bg-surface p-4 sm:col-span-2"><MapPin className="mt-0.5 shrink-0 text-primary" size={20} /><span><span className="block text-xs">Route</span><span className="font-semibold text-heading">{c.route}</span></span></li>
            </ul>

            <div id="book" className="mt-6 scroll-mt-20 lg:hidden">{bookCard}</div>

            <h2 className="mt-10 text-2xl">Overview</h2>
            <p className="mt-2">{c.summary}</p>

            {c.highlights.length > 0 && (<>
              <h2 className="mt-10 text-2xl">Highlights</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">{c.highlights.map((h) => <li key={h} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" />{h}</li>)}</ul>
            </>)}

            <h2 className="mt-10 text-2xl">Itinerary</h2>
            <div className="mt-3 space-y-3">
              {c.itinerary.map((d) => (
                <details key={d.day} open={d.day === 1} className="group rounded-2xl border border-line bg-white px-5 py-4">
                  <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-semibold text-heading">
                    <span><span className="mr-3 text-primary">Day {d.day}</span>{d.title}</span>
                    <span className="ml-4 transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3">{d.text}</p>
                </details>
              ))}
            </div>

            <h2 className="mt-10 flex items-center gap-2 text-2xl"><Calendar size={22} />Departure dates</h2>
            {dates.length ? (
              <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                {dates.map((d) => <li key={d.date} className="flex justify-between gap-3 px-4 py-3"><span className="font-medium text-heading">{fmtDate(d.date)}</span><span className="text-sm">{d.note}</span></li>)}
              </ul>
            ) : <p className="mt-2">No upcoming departures are listed right now.</p>}

            <h2 className="mt-10 text-2xl">Cabins</h2>
            <ul className="mt-3 space-y-3">
              {c.cabins.map((o) => (
                <li key={o.name} className="flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
                  <div><p className="font-semibold text-heading">{o.name}</p><p className="text-sm">{o.detail}</p></div>
                  <p className="shrink-0 text-lg font-bold text-heading">{inr(o.price)}<span className="block text-right text-xs font-normal">per person</span></p>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl">Inclusions / Exclusions</h2>
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              <ul className="space-y-2">{c.inclusions.map((i) => <li key={i} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" />{i}</li>)}</ul>
              <ul className="space-y-2">{c.exclusions.map((i) => <li key={i} className="flex gap-2"><X size={18} className="mt-0.5 shrink-0 text-discount" />{i}</li>)}</ul>
            </div>

            <h2 id="reviews" className="mt-10 scroll-mt-24 text-2xl">Reviews</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {reviewList.slice(0, 4).map((r) => (
                <figure key={r.name + r.text} className="rounded-2xl border border-line p-5">
                  <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} className="fill-accent text-accent" />)}</div>
                  <blockquote className="mt-2 text-heading">“{r.text}”</blockquote>
                  <figcaption className="mt-3 text-sm"><span className="font-semibold text-heading">{r.name}</span>, {r.city}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <aside className="hidden lg:block"><div className="sticky top-24">{bookCard}</div></aside>
        </div>
      </div>

      {related.length > 0 && <Section title="More cruises"><CardRail>{related.map((x) => <CruiseCard key={x.slug} c={x} />)}</CardRail></Section>}

      <div className="fixed inset-x-0 bottom-14 z-40 flex items-center justify-between gap-3 border-t border-line bg-white px-4 py-2 lg:hidden">
        <div><p className="text-xs">From</p><p className="text-lg font-bold text-heading">{inr(c.price)}</p></div>
        <Button href="#book" className="min-h-12 px-6">Check Availability</Button>
      </div>
      <div className="h-16 lg:hidden" />
    </>
  );
}
