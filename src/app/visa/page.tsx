import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, Search } from "lucide-react";
import { inr } from "@/lib/format";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Visa Services | MyTourbee",
  description: "Visa assistance for popular destinations. We check your documents, submit your application and keep you updated.",
  alternates: { canonical: "/visa" },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const TYPES = ["Tourist", "Business", "Transit"];

export default async function VisaPage({ searchParams }: PageProps<"/visa">) {
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 60).toLowerCase();
  const type = TYPES.includes(one(sp.type)) ? one(sp.type) : "";
  const all = await productService.getVisas();
  const list = all.filter((v) => (!q || `${v.country} ${v.title}`.toLowerCase().includes(q)) && (!type || v.type === type));
  const typeHref = (t: string) => `/visa?${new URLSearchParams({ ...(q ? { q } : {}), ...(t ? { type: t } : {}) }).toString()}`;

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link> &gt; Visa</nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">🛂 Visa Services</h1>
          <p className="mt-2 text-white/85 md:text-lg">Tell us where you are going. We check your documents, submit your application and keep you updated.</p>
          <form action="/visa" className="mt-5 flex gap-2 rounded-full bg-white p-2 pl-5">
            {type && <input type="hidden" name="type" value={type} />}
            <label className="flex flex-1 items-center gap-3"><Search size={20} className="shrink-0" /><span className="sr-only">Search country</span>
              <input name="q" defaultValue={q} type="search" placeholder="Which country?" className="min-h-11 w-full bg-transparent text-heading outline-none" /></label>
            <button className="min-h-11 rounded-full bg-primary px-6 font-semibold text-white hover:bg-primary-dark">Search</button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap gap-2">
          {[["", "All types"], ...TYPES.map((t) => [t, t])].map(([v, l]) => (
            <Link key={l} href={typeHref(v)} aria-current={type === v ? "true" : undefined}
              className={`flex min-h-11 items-center rounded-full border px-5 text-sm font-medium ${type === v ? "border-primary bg-primary text-white" : "border-line text-heading hover:border-primary"}`}>{l}</Link>
          ))}
        </div>

        {list.length ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((v) => (
              <Link key={v.slug} href={`/visa/${v.slug}`} className="block overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg">
                <div className="relative aspect-[4/3]"><Image src={v.image} alt={v.country} fill sizes="(min-width:768px) 25vw, 100vw" className="object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-heading">{v.type}</span></div>
                <div className="p-4">
                  <h2 className="text-lg">{v.country}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm"><Clock size={14} />{v.processing}</p>
                  <p className="mt-3 text-xs">Service price from</p>
                  <p className="text-xl font-bold text-heading">{inr(v.price)}</p>
                  <span className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">View & Apply</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl bg-surface p-10 text-center">
            <h2 className="text-2xl">We couldn&apos;t find that country yet</h2>
            <p className="mt-2">Tell us where you are going and our team will check if we can help.</p>
            <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">Talk to an expert</Link>
          </div>
        )}
        <p className="mt-10 text-sm">Visa decisions are made by each country&apos;s authorities. Approval is not guaranteed, and requirements, timing and official fees can change. We confirm the latest rules before you pay.</p>
      </div>
    </>
  );
}
