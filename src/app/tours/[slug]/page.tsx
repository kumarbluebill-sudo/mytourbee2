import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, Star, X } from "lucide-react";
import PackageCard from "@/components/cards/PackageCard";
import Button from "@/components/ui/Button";
import Section, { CardRail } from "@/components/ui/Section";
import { productService } from "@/lib/services";

export async function generateMetadata({ params }: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = await productService.getTour(slug);
  if (!t) return {};
  return {
    title: t.metaTitle || `${t.title} ${t.nights} Nights ${t.nights + 1} Days Tour Package | MyTourbee`,
    description: t.metaDescription || t.summary,
    alternates: { canonical: `/tours/${t.slug}` },
    openGraph: { title: t.title, description: t.summary, images: [t.gallery[0]] },
  };
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function TourPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params;
  const t = await productService.getTour(slug);
  if (!t) notFound();

  const [dest, all, reviewList] = await Promise.all([productService.getDestination(t.destination), productService.getTours(), productService.getReviews(t.slug)]);
  const related = all.filter((x) => x.slug !== t.slug && x.destination === t.destination).concat(all.filter((x) => x.slug !== t.slug && x.destination !== t.destination)).slice(0, 4);
  const was = t.discountPct ? Math.round(t.price / (1 - t.discountPct / 100)) : 0;
  const days = t.nights + 1;

  const ld = [
    {
      "@context": "https://schema.org", "@type": "Product", name: t.title, description: t.summary, image: t.gallery,
      aggregateRating: { "@type": "AggregateRating", ratingValue: t.rating, reviewCount: t.reviews },
      offers: { "@type": "Offer", priceCurrency: "INR", price: t.price, availability: "https://schema.org/InStock" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dest?.name ?? "Destinations", item: `/destinations/${t.destination}` },
        { "@type": "ListItem", position: 2, name: "Tours", item: "/tours" },
        { "@type": "ListItem", position: 3, name: t.title },
      ],
    },
  ];

  const bookCard = (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <p className="text-xs">From</p>
      <p className="text-3xl font-bold text-heading">{inr(t.price)}<span className="text-sm font-normal text-body"> / person</span></p>
      {was > 0 && (
        <p className="mt-1 text-sm"><s>{inr(was)}</s> <span className="font-semibold text-discount">{t.discountPct}% OFF</span></p>
      )}
      <div className="mt-4 grid gap-3">
        <Button href={`/booking?tour=${t.slug}`} className="min-h-12">Book Now</Button>
        <Button href={`/custom-trip?tour=${t.slug}`} variant="secondary" className="min-h-12">Customize This Trip</Button>
      </div>
      <p className="mt-3 text-center text-xs">Free enquiry. Talk to a travel expert any time.</p>
    </div>
  );

  return (
    <>
      {ld.map((l, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(l) }} />)}

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href={`/destinations/${t.destination}`} className="hover:text-primary">{dest?.name}</Link> &gt;{" "}
          <Link href="/tours" className="hover:text-primary">Tours</Link> &gt; <span className="text-heading">{t.title}</span>
        </nav>

        <div className="mt-4 grid gap-2 md:grid-cols-4 md:grid-rows-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[360px]">
            <Image src={t.gallery[0]} alt={t.title} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          {t.gallery.slice(1).map((g, i) => (
            <div key={g} className={`relative hidden aspect-[4/3] overflow-hidden rounded-2xl md:block`}>
              <Image src={g} alt={`${t.title} photo ${i + 2}`} fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl">{t.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 font-semibold text-heading"><Star size={16} className="fill-accent text-accent" />{t.rating}</span>
              <a href="#reviews" className="hover:text-primary">{t.reviews} Reviews</a>
              <span className="flex items-center gap-1"><Clock size={15} />{t.nights} Nights / {days} Days</span>
              <span className="rounded-full bg-surface px-3 py-0.5 text-sm">{t.type}</span>
            </p>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {["Hotel", "Breakfast", "Sightseeing", "Transfers"].map((i) => (
                <li key={i} className="flex items-center gap-1 rounded-full bg-surface px-3 py-1"><Check size={14} className="text-success" />{i}</li>
              ))}
            </ul>

            <div className="mt-6 lg:hidden">{bookCard}</div>

            <h2 className="mt-10 text-2xl">Overview</h2>
            <p className="mt-2">{t.summary}</p>

            <h2 className="mt-10 text-2xl">Highlights</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {t.highlights.map((h) => <li key={h} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" />{h}</li>)}
            </ul>

            <h2 className="mt-10 text-2xl">Day-by-Day Itinerary</h2>
            <div className="mt-3 space-y-3">
              {t.itinerary.map((d) => (
                <details key={d.day} open={d.day === 1} className="group rounded-2xl border border-line bg-white px-5 py-4">
                  <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-semibold text-heading">
                    <span><span className="mr-3 text-primary">Day {d.day}</span>{d.title}</span>
                    <span className="ml-4 transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3">{d.text}</p>
                </details>
              ))}
            </div>

            <h2 className="mt-10 text-2xl">Hotels</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {t.hotels.map((h) => (
                <li key={h.name} className="rounded-2xl border border-line p-4">
                  <p className="font-semibold text-heading">{h.name}</p>
                  <p className="mt-1 flex" aria-label={`${h.stars} star`}>{Array.from({ length: h.stars }, (_, i) => <Star key={i} size={14} className="fill-accent text-accent" />)}</p>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl">Inclusions / Exclusions</h2>
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              <ul className="space-y-2">{t.inclusions.map((i) => <li key={i} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" />{i}</li>)}</ul>
              <ul className="space-y-2">{t.exclusions.map((i) => <li key={i} className="flex gap-2"><X size={18} className="mt-0.5 shrink-0 text-discount" />{i}</li>)}</ul>
            </div>

            <h2 className="mt-10 text-2xl">Important Information</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Passport valid for at least 6 months from travel date (international trips).</li>
              <li>Check-in and check-out times follow each hotel&apos;s policy.</li>
              <li>Itinerary order may change because of weather or local conditions.</li>
            </ul>

            <h2 className="mt-10 text-2xl">Cancellation Policy</h2>
            <p className="mt-2">Free cancellation up to 30 days before departure. 50% charge between 15 and 30 days. No refund within 15 days. Final terms are confirmed at booking.</p>

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

            {dest && (
              <>
                <h2 className="mt-10 text-2xl">FAQs</h2>
                <div className="mt-3 space-y-3">
                  {dest.faqs.map((f) => (
                    <details key={f.q} className="group rounded-2xl border border-line bg-white px-5 py-4">
                      <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-semibold text-heading">
                        {f.q}<span className="ml-4 transition-transform group-open:rotate-45" aria-hidden>+</span>
                      </summary>
                      <p className="mt-3">{f.a}</p>
                    </details>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">{bookCard}</div>
          </aside>
        </div>
      </div>

      <Section title="You may also like">
        <CardRail>{related.map((p) => <PackageCard key={p.slug} p={p} />)}</CardRail>
      </Section>

      <div className="fixed inset-x-0 bottom-14 z-40 flex items-center justify-between gap-3 border-t border-line bg-white px-4 py-2 lg:hidden">
        <div><p className="text-xs">From</p><p className="text-lg font-bold text-heading">{inr(t.price)}</p></div>
        <Button href={`/booking?tour=${t.slug}`} className="min-h-12 px-8">Book Now</Button>
      </div>
      <div className="h-16 lg:hidden" />
    </>
  );
}
