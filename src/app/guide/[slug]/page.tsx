import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productService } from "@/lib/services";

export async function generateMetadata({ params }: PageProps<"/guide/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await productService.getPost(slug);
  if (!p) return {};
  return {
    title: p.metaTitle || `${p.title} | MyTourbee`,
    description: p.metaDescription || p.excerpt || p.title,
    alternates: { canonical: `/guide/${p.slug}` },
    openGraph: { title: p.title, images: [p.image] },
  };
}

export default async function PostPage({ params }: PageProps<"/guide/[slug]">) {
  const { slug } = await params;
  const p = await productService.getPost(slug);
  if (!p) notFound();
  const paragraphs = (p.body ?? "").split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/guide" className="hover:text-primary">Travel Guide</Link> &gt; <span className="text-heading">{p.title}</span>
      </nav>
      <h1 className="mt-4 text-3xl md:text-5xl">{p.title}</h1>
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl"><Image src={p.image} alt="" fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" /></div>
      {p.excerpt && <p className="mt-6 text-lg text-heading">{p.excerpt}</p>}
      <div className="mt-4 space-y-4">
        {paragraphs.length ? paragraphs.map((t, i) => <p key={i}>{t}</p>) : <p>This guide is being written. Check back soon, or ask our experts about this trip.</p>}
      </div>
      <Link href="/custom-trip" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-heading">Plan this trip with an expert</Link>
    </article>
  );
}
