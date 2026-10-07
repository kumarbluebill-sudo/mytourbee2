import Link from "next/link";
import { notFound } from "next/navigation";
import EntityForm from "@/components/admin/EntityForm";
import { schemas, type EntityKind } from "@/lib/admin-schema";
import { getCatalog, listCatalog } from "@/lib/store/catalog";

const publicPath: Record<string, string> = { tour: "tours", activity: "things-to-do", destination: "destinations", post: "guide", cruise: "cruises", visa: "visa" };

export default async function EditItem({ params }: PageProps<"/admin/c/[kind]/[slug]">) {
  const { kind, slug } = await params;
  if (!publicPath[kind]) notFound();
  const item = getCatalog<Record<string, unknown>>(kind as EntityKind, slug);
  if (!item) notFound();
  const schema = schemas[kind as EntityKind];
  const dests = listCatalog<{ slug: string; name: string }>("destination").map((d) => ({ value: d.slug, label: d.name }));
  return (
    <div>
      <Link href={`/admin/c/${kind}`} className="text-sm hover:text-primary">← {schema.plural}</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl">{String(item[schema.titleKey])}</h1>
        <Link href={`/${publicPath[kind]}/${slug}`} target="_blank" className="text-sm font-semibold text-primary">View on website ↗</Link>
      </div>
      <EntityForm kind={kind as EntityKind} slug={slug} initial={item} destinations={dests} />
    </div>
  );
}
