import Image from "next/image";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import type { Activity } from "@/data/types";

export default function ActivityCard({ a }: { a: Activity }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg">
      <WishlistButton itemKey={`activity:${a.slug}`} label={a.title} className="absolute right-3 top-3 z-10" />
      <Link href={`/things-to-do/${a.slug}`} className="block">
        <div className="relative aspect-[4/3]">
          <Image src={a.image} alt={a.title} fill sizes="(min-width:768px) 25vw, 70vw" className="object-cover" />
        </div>
        <div className="p-4">
          <h3 className="text-lg">{a.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Star size={14} className="fill-accent text-accent" />{a.rating} ({a.reviews.toLocaleString("en-IN")})
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm"><Clock size={14} />{a.duration}</p>
          <p className="mt-3 text-xs">From</p>
          <p className="text-xl font-bold text-heading">₹{a.price.toLocaleString("en-IN")}</p>
          <span className="mt-3 flex min-h-11 items-center justify-center rounded-full border border-primary text-sm font-semibold text-primary">View Experience</span>
        </div>
      </Link>
    </div>
  );
}
