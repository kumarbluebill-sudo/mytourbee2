import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/data/types";

export default function DestinationCard({ d }: { d: Destination }) {
  return (
    <Link href={`/destinations/${d.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl">
      <Image src={d.image} alt={`${d.name} travel`} fill sizes="(min-width:768px) 25vw, 70vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="text-xl font-bold uppercase !text-white">{d.name}</h3>
        <p className="text-sm text-white/80">{d.tours}+ Tours</p>
        <p className="mt-1 text-sm font-semibold">Explore →</p>
      </div>
    </Link>
  );
}
