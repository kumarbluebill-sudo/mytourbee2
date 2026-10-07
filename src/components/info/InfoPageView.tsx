import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { InfoPage } from "@/data/types";
import { productService } from "@/lib/services";

/** Renders text where blank lines separate paragraphs and lines starting with "- " are bullets. */
function RichText({ text }: { text: string }) {
  const blocks: ({ type: "p"; text: string } | { type: "ul"; items: string[] })[] = [];
  for (const raw of text.split(/\n{2,}/)) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    let list: string[] = [];
    const flush = () => { if (list.length) { blocks.push({ type: "ul", items: list }); list = []; } };
    let para: string[] = [];
    const flushPara = () => { if (para.length) { blocks.push({ type: "p", text: para.join(" ") }); para = []; } };
    for (const l of lines) {
      if (l.startsWith("- ")) { flushPara(); list.push(l.slice(2)); } else { flush(); para.push(l); }
    }
    flush(); flushPara();
  }
  return (
    <div className="mt-3 space-y-3">
      {blocks.map((b, i) => b.type === "p"
        ? <p key={i}>{b.text}</p>
        : <ul key={i} className="list-disc space-y-1 pl-5">{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>)}
    </div>
  );
}

export async function infoMetadata(slug: string, fallbackDescription: string): Promise<Metadata> {
  const p = await productService.getPage(slug);
  if (!p) return {};
  return {
    title: p.metaTitle || `${p.title} | MyTourbee`,
    description: p.metaDescription || p.intro || fallbackDescription,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function InfoPageView({ slug }: { slug: string }) {
  const p: InfoPage | undefined = await productService.getPage(slug);
  if (!p) notFound();

  const groups = [...new Set(p.faqs.map((f) => f.category))];
  const faqLd = p.faqs.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }
    : null;
  const id = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link> &gt; {p.title}</nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">{p.title}</h1>
          {p.updated && <p className="mt-2 text-sm text-white/70">Last updated: {p.updated}</p>}
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-10">
        {p.intro && <p className="text-lg text-heading">{p.intro}</p>}

        {p.sections.length > 3 && (
          <nav aria-label="On this page" className="mt-6 rounded-2xl bg-surface p-5">
            <p className="text-sm font-semibold text-heading">On this page</p>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {p.sections.map((s) => <li key={s.heading}><a href={`#${id(s.heading)}`} className="inline-block py-1 text-primary hover:underline">{s.heading}</a></li>)}
            </ul>
          </nav>
        )}

        {p.sections.map((s) => (
          <section key={s.heading} id={id(s.heading)} className="mt-10 scroll-mt-24">
            <h2 className="text-2xl">{s.heading}</h2>
            <RichText text={s.body} />
          </section>
        ))}

        {groups.length > 0 && (
          <>
            <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              {groups.map((g) => <a key={g} href={`#${id(g)}`} className="flex min-h-11 shrink-0 items-center rounded-full border border-line px-5 text-sm font-medium text-heading hover:border-primary">{g}</a>)}
            </div>
            {groups.map((g) => (
              <section key={g} id={id(g)} className="mt-10 scroll-mt-24">
                <h2 className="text-2xl">{g}</h2>
                <div className="mt-4 space-y-3">
                  {p.faqs.filter((f) => f.category === g).map((f) => (
                    <details key={f.q} className="group rounded-2xl border border-line bg-white px-5 py-4">
                      <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-semibold text-heading">{f.q}<span className="ml-4 transition-transform group-open:rotate-45" aria-hidden>+</span></summary>
                      <p className="mt-3">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        <div className="mt-12 rounded-3xl bg-surface p-6 text-center md:p-8">
          <h2 className="text-xl">Still have a question?</h2>
          <p className="mt-1">Our travel experts are happy to help.</p>
          <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">Contact us</Link>
        </div>
      </article>
    </>
  );
}
