import Link from "next/link";
import { notFound } from "next/navigation";
import EntityForm from "@/components/admin/EntityForm";
import { schemas, type EntityKind } from "@/lib/admin-schema";
import { listCatalog } from "@/lib/store/catalog";

export default async function NewItem({ params }: PageProps<"/admin/c/[kind]/new">) {
  const { kind } = await params;
  if (!["destination", "tour", "activity", "post", "cruise", "visa"].includes(kind)) notFound();
  const dests = listCatalog<{ slug: string; name: string }>("destination").map((d) => ({ value: d.slug, label: d.name }));
  return (
    <div>
      <Link href={`/admin/c/${kind}`} className="text-sm hover:text-primary">← {schemas[kind as EntityKind].plural}</Link>
      <h1 className="mb-6 mt-2 text-3xl">New {schemas[kind as EntityKind].label.toLowerCase()}</h1>
      <EntityForm kind={kind as EntityKind} destinations={dests} />
    </div>
  );
}
