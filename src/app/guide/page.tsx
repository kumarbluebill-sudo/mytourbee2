import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Travel Guide & Inspiration | MyTourbee",
  description: "Destination guides, itineraries and travel tips from the MyTourbee team.",
  alternates: { canonical: "/guide" },
};

export default async function GuidePage() {
  const posts = await productService.getPosts();
  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link> &gt; Travel Guide</nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">🗺️ Travel Inspiration</h1>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((p) => (
          <Link key={p.slug} href={`/guide/${p.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src={p.image} alt="" fill sizes="(min-width:768px) 25vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
            <h2 className="mt-3 text-lg">{p.title}</h2>
            {p.excerpt && <p className="mt-1 text-sm">{p.excerpt}</p>}
          </Link>
        ))}
      </div>
    </>
  );
}
