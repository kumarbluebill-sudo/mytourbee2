import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Star } from "lucide-react";
import ActivityCard from "@/components/cards/ActivityCard";
import PackageCard from "@/components/cards/PackageCard";
import Button from "@/components/ui/Button";
import Section, { CardRail } from "@/components/ui/Section";
import { productService } from "@/lib/services";

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await productService.getDestination(slug);
  if (!d) return {};
  return {
    title: d.metaTitle || `${d.name} Tour Packages & Things To Do | MyTourbee`,
    description: d.metaDescription || `Plan your ${d.name} trip: ${d.tours}+ tours, activities, hotels and travel tips. Best time to visit: ${d.bestTime}.`,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { images: [d.image] },
  };
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const d = await productService.getDestination(slug);
  if (!d) notFound();

  const [allTours, activities, posts] = await Promise.all([
    productService.getTours(),
    productService.getActivities(),
    productService.getPosts(),
  ]);

  const here = allTours.filter((t) => t.destination === d.slug);
  const deals = (here.length ? here : allTours).slice(0, 4);
  const things = activities.filter((a) => a.destination === d.slug);
  const picks = (things.length ? things : activities).slice(0, 4);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: d.faqs.map((f) => ({
      "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="relative flex min-h-[380px] items-end md:min-h-[460px]">
        <Image src={d.image} alt={`${d.name} travel`} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 text-white">
          <nav aria-label="Breadcrumb" className="text-sm text-white/80">
            <Link href="/" className="hover:text-white">Home</Link> &gt;{" "}
            <Link href="/destinations" className="hover:text-white">Destinations</Link> &gt; {d.name}
          </nav>
          <h1 className="mt-2 text-4xl !text-white md:text-6xl">{d.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-white/90">
            <span className="flex items-center gap-1"><MapPin size={16} />{d.region}</span>
            <span className="flex items-center gap-1"><Star size={16} />{d.tours}+ tours</span>
            <span className="flex items-center gap-1"><Calendar size={16} />Best time: {d.bestTime}</span>
          </p>
        </div>
      </section>

      <nav aria-label="On this page" className="sticky top-16 z-30 border-b border-line bg-white">
        <div className="scrollbar-none mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4">
          {["Overview", "Packages", "Activities", "Hotels", "Guide", "FAQs"].map((s) => (
            <a key={s} href={`#${s.toLowerCase()}`} className="flex min-h-12 shrink-0 items-center text-sm font-medium text-heading hover:text-primary">
              {s}
            </a>
          ))}
        </div>
      </nav>

      <div id="overview" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-12">
        <h2 className="text-2xl md:text-3xl">About {d.name}</h2>
        <p className="mt-3 max-w-3xl">{d.overview}</p>
        <Button href="/custom-trip" variant="accent" className="mt-6">Customize This Trip</Button>
      </div>

      <div id="packages" className="scroll-mt-32">
        <Section title={`${d.name} Packages`} tone="surface" cta={{ label: "View All Packages →", href: `/tours?destination=${d.slug}` }}>
          <CardRail>{deals.map((p) => <PackageCard key={p.slug} p={p} />)}</CardRail>
        </Section>
      </div>

      <div id="activities" className="scroll-mt-32">
        <Section title={`Things To Do in ${d.name}`} cta={{ label: "Explore Things To Do →", href: `/things-to-do?destination=${d.slug}` }}>
          <CardRail>{picks.map((a) => <ActivityCard key={a.slug} a={a} />)}</CardRail>
        </Section>
      </div>

      <div id="hotels" className="scroll-mt-32">
        <Section title={`Where to Stay in ${d.name}`} tone="surface">
          <ul className="grid gap-4 md:grid-cols-3">
            {d.hotels.map((h) => (
              <li key={h.name} className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-lg">{h.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm" aria-label={`${h.stars} star hotel`}>
                  {Array.from({ length: h.stars }, (_, i) => <Star key={i} size={14} className="fill-accent text-accent" />)}
                </p>
                <p className="mt-2 text-sm">{h.area}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div id="guide" className="scroll-mt-32">
        <Section title={`${d.name} Travel Guide`} cta={{ label: "Explore Travel Guide →", href: "/guide" }}>
          <CardRail>
            {posts.map((p) => (
              <Link key={p.slug} href={`/guide/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image src={p.image} alt="" fill sizes="(min-width:768px) 25vw, 70vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-3 text-lg">{p.title}</h3>
              </Link>
            ))}
          </CardRail>
        </Section>
      </div>

      <div id="faqs" className="scroll-mt-32">
        <Section title="Frequently Asked Questions" tone="surface">
          <div className="max-w-3xl space-y-3">
            {d.faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-line bg-white px-5 py-4">
                <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-semibold text-heading">
                  {f.q}<span className="ml-4 transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
