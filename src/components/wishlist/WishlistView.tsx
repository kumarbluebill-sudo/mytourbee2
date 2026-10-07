"use client";

import Link from "next/link";
import ActivityCard from "@/components/cards/ActivityCard";
import CruiseCard from "@/components/cards/CruiseCard";
import PackageCard from "@/components/cards/PackageCard";
import type { Activity, Cruise, Tour } from "@/data/types";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistView({ tours, activities, cruises }: { tours: Tour[]; activities: Activity[]; cruises: Cruise[] }) {
  const { items } = useWishlist();
  const t = tours.filter((x) => items.includes(`tour:${x.slug}`));
  const a = activities.filter((x) => items.includes(`activity:${x.slug}`));
  const c = cruises.filter((x) => items.includes(`cruise:${x.slug}`));

  if (!t.length && !a.length && !c.length) {
    return (
      <div className="rounded-3xl bg-surface p-10 text-center">
        <p className="text-4xl" aria-hidden>♡</p>
        <h2 className="mt-2 text-2xl">Your wishlist is empty</h2>
        <p className="mt-2">Tap the heart on any package or experience to save it here.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tours" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">Browse tours</Link>
          <Link href="/things-to-do" className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">Things To Do</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {t.length > 0 && (
        <section>
          <h2 className="text-2xl">Tour Packages ({t.length})</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{t.map((x) => <PackageCard key={x.slug} p={x} />)}</div>
        </section>
      )}
      {c.length > 0 && (
        <section>
          <h2 className="text-2xl">Cruises ({c.length})</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{c.map((x) => <CruiseCard key={x.slug} c={x} />)}</div>
        </section>
      )}
      {a.length > 0 && (
        <section>
          <h2 className="text-2xl">Things To Do ({a.length})</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{a.map((x) => <ActivityCard key={x.slug} a={x} />)}</div>
        </section>
      )}
    </div>
  );
}
