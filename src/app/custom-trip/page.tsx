import type { Metadata } from "next";
import Link from "next/link";
import CustomTripForm from "@/components/custom-trip/CustomTripForm";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Create Your Custom Trip | MyTourbee",
  description: "Tell us where, when and how you want to travel. A MyTourbee travel expert will build your trip and send a quote.",
  alternates: { canonical: "/custom-trip" },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function CustomTripPage({ searchParams }: PageProps<"/custom-trip">) {
  const sp = await searchParams;
  const destinations = await productService.getAllDestinations();

  // Prefill from a tour, a destination, or an activity that sent the visitor here.
  const tourSlug = one(sp.tour);
  const tour = tourSlug ? await productService.getTour(tourSlug) : undefined;
  const slug = tour?.destination ?? one(sp.destination);
  const dest = destinations.find((d) => d.slug === slug);

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">Home</Link> &gt; Custom Trip
          </nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">✨ Your Trip. Your Way.</h1>
          <p className="mt-2 max-w-xl text-white/85 md:text-lg">
            Tell us what you want. Our travel experts will create it for you.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          {tour && <p className="mb-4 rounded-2xl bg-surface p-4 text-sm">Customizing: <span className="font-semibold text-heading">{tour.title}</span> ({tour.duration})</p>}
          <CustomTripForm
            places={destinations.map((d) => ({ slug: d.slug, name: d.name }))}
            initial={{
              destinations: dest ? [dest.name] : [],
              source: tour ? `tour:${tour.slug}` : one(sp.activity) ? `activity:${one(sp.activity)}` : "",
              ...(tour && { nights: (tour.nights <= 3 ? "1-3" : tour.nights <= 5 ? "4-5" : tour.nights <= 7 ? "5-7" : tour.nights <= 10 ? "8-10" : "10+") }),
            }}
          />
        </div>
        <aside className="space-y-4 lg:pt-2">
          {[
            ["🎯", "Built around you", "Hotels, pace and activities chosen for your style."],
            ["💰", "No obligation", "Free quote. Pay only when you are happy."],
            ["📞", "Real human support", "A travel expert, from planning to return."],
          ].map(([i, t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-line p-4">
              <span className="text-2xl">{i}</span>
              <div><h2 className="text-base">{t}</h2><p className="text-sm">{d}</p></div>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
