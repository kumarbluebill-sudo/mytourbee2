import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BookingForm from "@/components/booking/BookingForm";
import { tripHref } from "@/lib/format";
import { getQuote } from "@/lib/quote";

export const metadata: Metadata = { title: "Book Now | MyTourbee", robots: { index: false } };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const int = (v: string, d: number, min: number, max: number) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};

export default async function BookingPage({ searchParams }: PageProps<"/booking">) {
  const sp = await searchParams;
  const kind = one(sp.activity) ? "activity" : one(sp.cruise) ? "cruise" : one(sp.visa) ? "visa" : "tour";
  const slug = one(sp.activity) || one(sp.cruise) || one(sp.visa) || one(sp.tour);
  const quote = slug ? await getQuote(kind, slug, one(sp.option)) : null;

  if (!quote) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl">Choose something to book</h1>
        <p className="mt-2">Pick a tour, an experience, a cruise or a visa service first, then come back here.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tours" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">Browse tours</Link>
          <Link href="/things-to-do" className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">Things To Do</Link>
          <Link href="/cruises" className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">Cruises</Link>
          <Link href="/visa" className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">Visa</Link>
        </div>
      </div>
    );
  }

  const back = tripHref(quote.kind, quote.slug);
  const guests = int(one(sp.guests), 2, 1, 20);

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href={back} className="hover:text-primary">← Back to {quote.title}</Link>
        </nav>
        <h1 className="mt-3 text-3xl md:text-4xl">{{ tour: "Book your trip", activity: "Check availability & book", cruise: "Book your cruise", visa: "Start your visa application" }[quote.kind]}</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <BookingForm
            quote={quote}
            initial={{ date: one(sp.date), option: one(sp.option), adults: quote.kind === "tour" ? int(one(sp.adults), 2, 1, 20) : guests, children: 0 }}
          />
          <aside className="lg:order-last">
            <div className="overflow-hidden rounded-2xl border border-line bg-white lg:sticky lg:top-24">
              <div className="relative aspect-[16/9]"><Image src={quote.image} alt="" fill sizes="340px" className="object-cover" /></div>
              <div className="p-5">
                <h2 className="text-lg">{quote.title}</h2>
                <p className="mt-1 text-sm">{quote.subtitle}</p>
                <p className="mt-3 text-sm">From ₹{quote.unitPrice.toLocaleString("en-IN")} {quote.unitLabel}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
