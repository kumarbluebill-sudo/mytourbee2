import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import type { Cruise } from "@/data/types";

export default function CruiseCard({ c }: { c: Cruise }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg">
      <WishlistButton itemKey={`cruise:${c.slug}`} label={c.title} className="absolute right-3 top-3 z-10" />
      <Link href={`/cruises/${c.slug}`} className="block">
        <div className="relative aspect-[4/3]">
          <Image src={c.image} alt={c.title} fill sizes="(min-width:768px) 25vw, 70vw" className="object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-heading">🚢 {c.line}</span>
        </div>
        <div className="p-4">
          <h3 className="text-lg">{c.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm">{c.route}</p>
          <p className="mt-1 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Star size={14} className="fill-accent text-accent" />{c.rating}</span>
            <span>{c.nights} nights</span>
          </p>
          <p className="mt-3 text-xs">From</p>
          <p className="text-xl font-bold text-heading">₹{c.price.toLocaleString("en-IN")}</p>
          <span className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">View Cruise</span>
        </div>
      </Link>
    </div>
  );
}
