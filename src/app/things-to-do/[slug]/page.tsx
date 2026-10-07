import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, Star, X } from "lucide-react";
import ActivityCard from "@/components/cards/ActivityCard";
import Button from "@/components/ui/Button";
import Section, { CardRail } from "@/components/ui/Section";
import { productService } from "@/lib/services";

export async function generateMetadata({ params }: PageProps<"/things-to-do/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await productService.getActivity(slug);
  if (!a) return {};
  return {
    title: a.metaTitle || `${a.title} Tickets & Tours | MyTourbee`,
    description: a.metaDescription || a.summary,
    alternates: { canonical: `/things-to-do/${a.slug}` },
    openGraph: { title: a.title, description: a.summary, images: [a.gallery[0]] },
  };
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function ActivityPage({ params }: PageProps<"/things-to-do/[slug]">) {
  const { slug } = await params;
  const a = await productService.getActivity(slug);
  if (!a) notFound();

  const [dest, all, reviewList] = await Promise.all([productService.getDestination(a.destination), productService.getActivities(), productService.getReviews(a.slug)]);
  const related = [...all.filter((x) => x.slug !== a.slug && x.destination === a.destination), ...all.filter((x) => x.slug !== a.slug && x.destination !== a.destination)].slice(0, 4);

  const ld = [
    {
      "@context": "https://schema.org", "@type": "Product", name: a.title, description: a.summary, image: a.gallery,
      aggregateRating: { "@type": "AggregateRating", ratingValue: a.rating, reviewCount: a.reviews },
      offers: { "@type": "Offer", priceCurrency: "INR", price: a.price, availability: "https://schema.org/InStock" },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: a.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  const bookCard = (
    <form action="/booking" method="get" className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <input type="hidden" name="activity" value={a.slug} />
      <p className="text-xs">From</p>
      <p className="text-3xl font-bold text-heading">{inr(a.price)}<span className="text-sm font-normal text-body"> / person</span></p>
      <label className="mt-4 block text-sm font-medium text-heading">Date
        <input type="date" name="date" required className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-heading" />
      </label>
      <label className="mt-3 block text-sm font-medium text-heading">Option
        <select name="option" className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading">
          {a.options.map((o) => <option key={o.name} value={o.name}>{o.name} — {inr(o.price)}</option>)}
        </select>
      </label>
      <label className="mt-3 block text-sm font-medium text-heading">Guests
        <select name="guests" className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
        </select>
      </label>
      <button className="mt-4 min-h-12 w-full rounded-full bg-primary font-semibold text-white hover:bg-primary-dark">Check Availability</button>
      <p className="mt-3 text-center text-xs">Free cancellation up to 24 hours before.</p>
    </form>
  );

  return (
    <>
      {ld.map((l, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(l) }} />)}

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href="/things-to-do" className="hover:text-primary">Things To Do</Link> &gt;{" "}
          <Link href={`/things-to-do?destination=${a.destination}`} className="hover:text-primary">{dest?.name}</Link> &gt;{" "}
          <span className="text-heading">{a.title}</span>
        </nav>

        <div className="mt-4 grid gap-2 md:grid-cols-4 md:grid-rows-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[360px]">
            <Image src={a.gallery[0]} alt={a.title} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          {a.gallery.slice(1).map((g, i) => (
            <div key={g} className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl md:block">
              <Image src={g} alt={`${a.title} photo ${i + 2}`} fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl">{a.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 font-semibold text-heading"><Star size={16} className="fill-accent text-accent" />{a.rating}</span>
              <a href="#reviews" className="hover:text-primary">{a.reviews.toLocaleString("en-IN")} Reviews</a>
              <span className="flex items-center gap-1"><Clock size={15} />{a.duration}</span>
              <span className="rounded-full bg-surface px-3 py-0.5 text-sm">{a.category}</span>
            </p>

            <div id="book" className="mt-6 scroll-mt-20 lg:hidden">{bookCard}</div>

            <h2 className="mt-10 text-2xl">About this experience</h2>
            <p className="mt-2">{a.summary}</p>

            <h2 className="mt-10 text-2xl">Highlights</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {a.highlights.map((h) => <li key={h} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" />{h}</li>)}
            </ul>

            <h2 className="mt-10 text-2xl">Options</h2>
            <ul className="mt-3 space-y-3">
              {a.options.map((o) => (
                <li key={o.name} className="flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
                  <div>
                    <p className="font-semibold text-heading">{o.name}</p>
                    <p className="text-sm">{o.detail}</p>
                  </div>
                  <p className="shrink-0 text-lg font-bold text-heading">{inr(o.price)}</p>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl">What&apos;s included</h2>
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              <ul className="space-y-2">{a.included.map((i) => <li key={i} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" />{i}</li>)}</ul>
              <ul className="space-y-2">{a.notIncluded.map((i) => <li key={i} className="flex gap-2"><X size={18} className="mt-0.5 shrink-0 text-discount" />{i}</li>)}</ul>
            </div>

            <h2 className="mt-10 text-2xl">Cancellation Policy</h2>
            <p className="mt-2">Cancel free of charge up to 24 hours before the start time. Within 24 hours the booking is non-refundable.</p>

            <h2 id="reviews" className="mt-10 scroll-mt-24 text-2xl">Reviews</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {reviewList.slice(0, 4).map((r) => (
                <figure key={r.name} className="rounded-2xl border border-line p-5">
                  <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} className="fill-accent text-accent" />)}</div>
                  <blockquote className="mt-2 text-heading">“{r.text}”</blockquote>
                  <figcaption className="mt-3 text-sm"><span className="font-semibold text-heading">{r.name}</span>, {r.city}</figcaption>
                </figure>
              ))}
            </div>

            <h2 className="mt-10 text-2xl">FAQs</h2>
            <div className="mt-3 space-y-3">
              {a.faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-line bg-white px-5 py-4">
                  <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-semibold text-heading">
                    {f.q}<span className="ml-4 transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">{bookCard}</div>
          </aside>
        </div>
      </div>

      <Section title="More things to do">
        <CardRail>{related.map((x) => <ActivityCard key={x.slug} a={x} />)}</CardRail>
      </Section>

      <div className="fixed inset-x-0 bottom-14 z-40 flex items-center justify-between gap-3 border-t border-line bg-white px-4 py-2 lg:hidden">
        <div><p className="text-xs">From</p><p className="text-lg font-bold text-heading">{inr(a.price)}</p></div>
        <Button href="#book" className="min-h-12 px-6">Check Availability</Button>
      </div>
      <div className="h-16 lg:hidden" />
    </>
  );
}
