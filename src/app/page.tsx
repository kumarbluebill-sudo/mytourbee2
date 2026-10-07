import Link from "next/link";
import { Star } from "lucide-react";
import Hero from "@/components/home/Hero";
import NewsletterForm from "@/components/home/NewsletterForm";
import Section, { CardRail } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import DestinationCard from "@/components/cards/DestinationCard";
import PackageCard from "@/components/cards/PackageCard";
import ActivityCard from "@/components/cards/ActivityCard";
import CruiseCard from "@/components/cards/CruiseCard";
import { productService } from "@/lib/services";
import { activityCategories, interests, quickCategories } from "@/data/mytourbee";
import Image from "next/image";

const why = [
  ["🛡️", "Trusted Experts", "Personal support from booking to travel."],
  ["💰", "Best Value", "Competitive packages and deals."],
  ["🌍", "Global Experiences", "Domestic and international travel."],
  ["🎯", "Personalized Trips", "Packages designed around you."],
  ["📞", "Real Human Support", "We're here when you need us."],
];

const quickHref: Record<string, string> = {
  Tours: "/tours", "Things To Do": "/things-to-do", International: "/tours?scope=international", Domestic: "/tours?scope=domestic",
  Cruises: "/cruises", Visa: "/visa",
};

function Chips({ items, base }: { items: string[][]; base: string }) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {items.map(([icon, label]) => (
        <Link
          key={label}
          href={base === "/search" && quickHref[label] ? quickHref[label] : `${base}?q=${encodeURIComponent(label)}`}
          className="flex min-h-14 shrink-0 items-center gap-3 rounded-2xl border border-line bg-white px-5 font-medium text-heading transition-shadow hover:shadow-md"
        >
          <span className="text-2xl">{icon}</span>{label}
        </Link>
      ))}
    </div>
  );
}

export default async function Home() {
  const [trending, domestic, international, deals, activities, reviews, posts, cruiseList] = await Promise.all([
    productService.getTrendingDestinations(),
    productService.getDomesticDestinations(),
    productService.getInternationalDestinations(),
    productService.getDeals(),
    productService.getActivities(),
    productService.getReviews(),
    productService.getPosts(),
    productService.getCruises(),
  ]);

  return (
    <>
      <Hero />

      <Section title="What are you looking for?">
        <Chips items={quickCategories} base="/search" />
      </Section>

      <Section title="Trending Now 🔥" tone="surface">
        <CardRail>{trending.map((d) => <DestinationCard key={d.slug} d={d} />)}</CardRail>
      </Section>

      <Section
        title="Explore India 🇮🇳"
        subtitle="Discover incredible experiences closer to home."
        cta={{ label: "View All Domestic Tours →", href: "/tours/domestic" }}
      >
        <CardRail cols={3}>{domestic.map((d) => <DestinationCard key={d.slug} d={d} />)}</CardRail>
      </Section>

      <Section
        title="Explore The World 🌍"
        tone="surface"
        cta={{ label: "Explore International Tours →", href: "/tours/international" }}
      >
        <CardRail>{international.map((d) => <DestinationCard key={d.slug} d={d} />)}</CardRail>
      </Section>

      <Section title="🔥 Unmissable Travel Deals" cta={{ label: "See All Deals →", href: "/deals" }}>
        <CardRail>{deals.map((p) => <PackageCard key={p.slug} p={p} />)}</CardRail>
      </Section>

      <Section
        title="🎟️ Things To Do"
        subtitle="Make memories, not just itineraries."
        tone="surface"
        cta={{ label: "Explore Things To Do →", href: "/things-to-do" }}
      >
        <div className="mb-8"><Chips items={activityCategories} base="/things-to-do" /></div>
        <CardRail>{activities.slice(0, 4).map((a) => <ActivityCard key={a.slug} a={a} />)}</CardRail>
      </Section>

      {cruiseList.length > 0 && (
        <Section title="🚢 Cruise Holidays" subtitle="Sail with Cordelia, MSC, Royal Caribbean, Disney and more." cta={{ label: "Explore Cruises →", href: "/cruises" }}>
          <CardRail>{cruiseList.slice(0, 4).map((c) => <CruiseCard key={c.slug} c={c} />)}</CardRail>
        </Section>
      )}

      <Section title="What kind of trip are you planning?" tone="surface">
        <Chips items={interests} base="/tours" />
      </Section>

      <section className="bg-primary-dark">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
          <h2 className="text-3xl !text-white md:text-5xl">
            <span className="hidden md:inline">✨ Your Trip. Your Way.</span>
            <span className="md:hidden">Your dream trip, built around you.</span>
          </h2>
          <p className="mt-4 hidden text-lg text-white/85 md:block">
            Can&apos;t find exactly what you&apos;re looking for? Tell us what you want. Our travel experts will create it for you.
          </p>
          <Button href="/custom-trip" variant="accent" className="mt-8 min-h-12 px-8">Create My Trip</Button>
        </div>
      </section>

      <Section title="Why Travel With MyTourbee?">
        <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-5">
          {why.map(([icon, title, text]) => (
            <li key={title}>
              <span className="text-3xl">{icon}</span>
              <h3 className="mt-2 text-lg">{title}</h3>
              <p className="mt-1 text-sm">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="⭐ Loved By Travellers" tone="surface">
        <CardRail cols={3}>
          {reviews.map((r) => (
            <figure key={r.name} className="rounded-2xl border border-line bg-white p-6">
              <div className="flex text-accent" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={18} className="fill-accent" />)}
              </div>
              <blockquote className="mt-3 text-heading">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <p className="font-semibold text-heading">{r.name}</p>
                <p>{r.city}</p>
                <p className="mt-1 text-primary">{r.trip}</p>
              </figcaption>
            </figure>
          ))}
        </CardRail>
      </Section>

      <Section
        title="🗺️ Travel Inspiration"
        cta={{ label: "Explore Travel Guide →", href: "/guide" }}
      >
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

      <section className="bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl">✈️ Your Next Adventure Starts Here</h2>
          <p className="mt-2">Travel deals, destination inspiration and special offers.</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
