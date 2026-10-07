import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import type { Deal } from "@/data/types";

export default function PackageCard({ p }: { p: Deal }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg">
      <WishlistButton itemKey={`tour:${p.slug}`} label={p.title} className="absolute right-3 top-3 z-10" />
      <Link href={`/tours/${p.slug}`} className="block">
        <div className="relative aspect-[4/3]">
          <Image src={p.image} alt={p.title} fill sizes="(min-width:768px) 25vw, 70vw" className="object-cover" />
          {p.discountPct > 0 && <span className="absolute left-3 top-3 rounded-full bg-discount px-3 py-1 text-xs font-bold text-white">🔥 {p.discountPct}% OFF</span>}
        </div>
        <div className="p-4">
          <h3 className="text-lg">{p.title}</h3>
          <p className="mt-1 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Star size={14} className="fill-accent text-accent" />{p.rating}</span>
            <span>{p.duration}</span>
          </p>
          <p className="mt-3 text-xs">From</p>
          <p className="text-xl font-bold text-heading">₹{p.price.toLocaleString("en-IN")}</p>
          <span className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">View Deal</span>
        </div>
      </Link>
    </div>
  );
}
