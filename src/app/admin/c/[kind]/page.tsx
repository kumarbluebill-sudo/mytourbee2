import Link from "next/link";
import { notFound } from "next/navigation";
import { schemas, type EntityKind } from "@/lib/admin-schema";
import { inr } from "@/lib/format";
import { listCatalog } from "@/lib/store/catalog";

const KINDS = ["destination", "tour", "activity", "post", "cruise", "visa"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function CatalogList({ params, searchParams }: PageProps<"/admin/c/[kind]">) {
  const { kind } = await params;
  if (!KINDS.includes(kind)) notFound();
  const q = one((await searchParams).q).toLowerCase().trim();
  const schema = schemas[kind as EntityKind];
  type Item = Record<string, string | number | boolean | undefined> & { slug: string };
  const items = listCatalog<Item>(kind as EntityKind).filter((i) => !q || `${i[schema.titleKey]} ${i.slug}`.toLowerCase().includes(q));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{schema.plural}</h1>
        <Link href={`/admin/c/${kind}/new`} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">+ Add {schema.label.toLowerCase()}</Link>
      </div>
      <form className="mt-4"><label className="sr-only" htmlFor="q">Search</label><input id="q" name="q" defaultValue={q} placeholder="Search…" type="search" className="min-h-11 w-full max-w-sm rounded-xl border border-line px-3 text-heading" /></form>
      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
        {items.map((i) => (
          <li key={i.slug}>
            <Link href={`/admin/c/${kind}/${i.slug}`} className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-surface">
              <span><span className="font-semibold text-heading">{String(i[schema.titleKey])}</span><span className="ml-2 text-xs">/{i.slug}</span></span>
              <span className="text-sm">
                {kind === "destination" && `${i.region}${i.trending ? " · trending" : ""}`}
                {kind === "cruise" && `${i.line} · ${i.nights} nights · from ${inr(Number(i.price))}`}
                {kind === "visa" && `${i.type} · ${inr(Number(i.price))}`}
                {i.published === false ? " · DRAFT" : ""}
                {(kind === "tour" || kind === "activity") && `${inr(Number(i.price))}${Number(i.discountPct) > 0 ? ` · ${i.discountPct}% off` : ""}`}
              </span>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="px-4 py-6 text-center">Nothing found.</li>}
      </ul>
    </div>
  );
}
