import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { trendingSearches } from "@/data/mytourbee";

export default function Hero() {
  return (
    <section className="relative flex min-h-[520px] items-center justify-center md:min-h-[600px]">
      <Image
        src="https://picsum.photos/seed/tb-hero/1920/900"
        alt="" fill priority sizes="100vw" className="object-cover"
      />
      <div className="absolute inset-0 bg-heading/55" />
      <div className="relative w-full max-w-3xl px-4 text-center">
        <h1 className="text-3xl uppercase !text-white md:text-5xl">Where will you go next?</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/90 md:text-lg">
          Discover unforgettable places, experiences and journeys with MyTourbee.
        </p>
        <form action="/search" className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-xl md:flex-row md:items-center md:rounded-full md:pl-6">
          <label className="flex flex-1 items-center gap-3 px-2 text-left">
            <Search size={20} className="shrink-0 text-body" />
            <span className="sr-only">Search destinations, activities or experiences</span>
            <input
              name="q" type="search" placeholder="Where do you want to go?"
              className="min-h-11 w-full bg-transparent text-heading outline-none placeholder:text-body"
            />
          </label>
          <button className="min-h-12 rounded-full bg-primary px-8 font-semibold text-white hover:bg-primary-dark">
            Search
          </button>
        </form>
        <p className="mt-5 hidden text-sm text-white/90 md:block">
          <span className="font-semibold">Trending:</span>{" "}
          {trendingSearches.map((t, i) => (
            <span key={t}>
              {i > 0 && " · "}
              <Link href={`/search?q=${t}`} className="underline-offset-2 hover:underline">{t}</Link>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
