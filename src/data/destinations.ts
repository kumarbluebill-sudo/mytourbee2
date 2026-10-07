import { domestic, international, trending } from "./mytourbee";
import type { Destination, Seo } from "./types";

export type Region = "India" | "Asia" | "Middle East" | "Europe" | "Australia";
export const regions: Region[] = ["India", "Asia", "Middle East", "Europe", "Australia"];

const regionOf: Record<string, Region> = {
  kerala: "India", kashmir: "India", goa: "India", rajasthan: "India", himachal: "India", andaman: "India",
  singapore: "Asia", thailand: "Asia", malaysia: "Asia", japan: "Asia", bali: "Asia",
  dubai: "Middle East", switzerland: "Europe", europe: "Europe", australia: "Australia",
};

export type DestinationDetail = Destination & {
  region: Region;
  trending?: boolean;
  overview: string;
  bestTime: string;
  hotels: { name: string; stars: number; area: string }[];
  faqs: { q: string; a: string }[];
} & Seo;

const bestTime: Record<string, string> = {
  dubai: "November to March", switzerland: "June to September", singapore: "February to April",
  bali: "April to October", kerala: "September to March", kashmir: "March to October",
  goa: "November to February", rajasthan: "October to March", himachal: "March to June",
  andaman: "November to May", thailand: "November to February", malaysia: "March to October",
  europe: "May to September", japan: "March to May", australia: "September to November",
};

function detail(d: Destination): DestinationDetail {
  const region = regionOf[d.slug] ?? "Asia";
  return {
    ...d,
    region,
    bestTime: bestTime[d.slug] ?? "Year round",
    overview: `${d.name} is one of MyTourbee's most loved destinations. Choose a ready-made package, add experiences you will remember, or ask our travel experts to build a trip around you.`,
    hotels: [
      { name: `${d.name} Grand Hotel`, stars: 5, area: "City centre" },
      { name: `${d.name} Comfort Stay`, stars: 4, area: "Near attractions" },
      { name: `${d.name} Budget Inn`, stars: 3, area: "Well connected" },
    ],
    faqs: [
      { q: `When is the best time to visit ${d.name}?`, a: `The best time to visit ${d.name} is ${bestTime[d.slug] ?? "year round"}.` },
      { q: "Can I customise a package?", a: "Yes. Use Customize This Trip and a MyTourbee travel expert will tailor it to your dates, budget and style." },
      { q: "Are flights included?", a: "Packages list exactly what is included. Flights can be added on request." },
      { q: "What is the cancellation policy?", a: "It depends on the package and supplier. The details are shown on every package page before you book." },
    ],
  };
}

const unique = new Map<string, Destination>();
[...trending, ...domestic, ...international].forEach((d) => unique.set(d.slug, d));
if (!unique.has("bali")) unique.set("bali", { slug: "bali", name: "Bali", tours: 74, image: "https://picsum.photos/seed/tb-Bali/800/600" });

export const allDestinations: DestinationDetail[] = [...unique.values()].map(detail);
