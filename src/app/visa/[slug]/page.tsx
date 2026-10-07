import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { inr } from "@/lib/format";
import { productService } from "@/lib/services";

export async function generateMetadata({ params }: PageProps<"/visa/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const v = await productService.getVisa(slug);
  if (!v) return {};
  return {
    title: v.metaTitle || `${v.title} from India | MyTourbee`,
    description: v.metaDescription || v.summary,
    alternates: { canonical: `/visa/${v.slug}` },
    openGraph: { title: v.title, description: v.summary, images: [v.image] },
  };
}

export default async function VisaDetail({ params }: PageProps<"/visa/[slug]">) {
  const { slug } = await params;
  const v = await productService.getVisa(slug);
  if (!v) notFound();

  const facts = [["Processing time", v.processing], ["Validity", v.validity], ["Stay", v.stay], ["Entry", v.entry], ["Type", v.type]];
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: v.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  const applyCard = (
    <form action="/booking" method="get" className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <input type="hidden" name="visa" value={v.slug} />
      <p className="text-xs">Service price</p>
      <p className="text-3xl font-bold text-heading">{inr(v.price)}<span className="text-sm font-normal text-body"> / applicant</span></p>
      <label className="mt-4 block text-sm font-medium text-heading">Intended travel date
        <input type="date" name="date" min={new Date().toISOString().slice(0, 10)} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-heading" />
      </label>
      <label className="mt-3 block text-sm font-medium text-heading">Applicants
        <select name="guests" className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</select>
      </label>
      <button className="mt-4 min-h-12 w-full rounded-full bg-primary font-semibold text-white hover:bg-primary-dark">Apply Now</button>
      <p className="mt-3 text-center text-xs">No payment now. We confirm the rules first.</p>
    </form>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="relative flex min-h-[300px] items-end md:min-h-[360px]">
        <Image src={v.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 text-white">
          <nav aria-label="Breadcrumb" className="text-sm text-white/80"><Link href="/visa" className="hover:text-white">Visa</Link> &gt; {v.country}</nav>
          <h1 className="mt-2 text-3xl !text-white md:text-5xl">{v.title}</h1>
          <p className="mt-2 max-w-2xl text-white/90">{v.summary}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {facts.map(([k, val]) => <div key={k} className="rounded-2xl bg-surface p-4"><dt className="text-xs">{k}</dt><dd className="mt-1 font-semibold text-heading">{val}</dd></div>)}
          </dl>

          <div className="mt-6 lg:hidden">{applyCard}</div>

          <h2 className="mt-10 text-2xl">Documents required</h2>
          <ul className="mt-3 space-y-2">{v.requirements.map((r) => <li key={r} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" />{r}</li>)}</ul>

          <h2 className="mt-10 text-2xl">How it works</h2>
          <ol className="mt-3 space-y-3">
            {v.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-2xl border border-line p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
                <div><p className="font-semibold text-heading">{s.title}</p><p className="text-sm">{s.text}</p></div>
              </li>
            ))}
          </ol>

          <h2 className="mt-10 text-2xl">FAQs</h2>
          <div className="mt-3 space-y-3">
            {v.faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-line bg-white px-5 py-4">
                <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-semibold text-heading">{f.q}<span className="ml-4 transition-transform group-open:rotate-45" aria-hidden>+</span></summary>
                <p className="mt-3">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mt-8 rounded-2xl bg-surface p-4 text-sm">Visa decisions are made by the authorities of each country and approval is not guaranteed. Requirements, processing times and official fees can change, so we confirm the latest rules before you pay.</p>
          <Button href="/contact" variant="secondary" className="mt-4">Talk to a visa expert</Button>
        </div>
        <aside className="hidden lg:block"><div className="sticky top-24">{applyCard}</div></aside>
      </div>
    </>
  );
}
