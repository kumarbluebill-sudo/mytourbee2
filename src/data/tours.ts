import { allDestinations } from "./destinations";
import type { Tour, TravelType } from "./types";

const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

type Row = [slug: string, title: string, dest: string, nights: number, price: number, off: number, type: TravelType, rating: number, reviews: number];

const rows: Row[] = [
  ["dubai-escape", "Dubai Escape", "dubai", 5, 49999, 20, "Family", 4.8, 124],
  ["dubai-explorer", "Dubai Explorer", "dubai", 4, 42999, 0, "Friends", 4.7, 86],
  ["swiss-alps", "Swiss Alps Classic", "switzerland", 6, 139999, 15, "Honeymoon", 4.9, 98],
  ["singapore-fun", "Singapore Family Fun", "singapore", 4, 64999, 18, "Family", 4.7, 142],
  ["bali-bliss", "Bali Bliss", "bali", 5, 54999, 25, "Honeymoon", 4.8, 77],
  ["thailand-escape", "Thailand Island Escape", "thailand", 4, 38999, 10, "Friends", 4.6, 133],
  ["europe-grand", "Grand Europe Tour", "europe", 9, 219999, 0, "Luxury", 4.8, 61],
  ["japan-highlights", "Japan Highlights", "japan", 7, 169999, 0, "Luxury", 4.9, 44],
  ["kerala-backwaters", "Kerala Backwaters", "kerala", 5, 28999, 12, "Honeymoon", 4.8, 156],
  ["kashmir-paradise", "Kashmir Paradise", "kashmir", 5, 32999, 0, "Family", 4.7, 91],
  ["goa-getaway", "Goa Getaway", "goa", 3, 17999, 15, "Friends", 4.5, 120],
  ["rajasthan-royal", "Royal Rajasthan", "rajasthan", 6, 36999, 0, "Luxury", 4.7, 73],
  ["andaman-islands", "Andaman Islands", "andaman", 5, 41999, 10, "Adventure", 4.8, 65],
  ["himachal-adventure", "Himachal Adventure", "himachal", 5, 24999, 0, "Adventure", 4.6, 58],
];

const baseIncl = ["Hotel stay", "Daily breakfast", "Sightseeing as per itinerary", "Airport and local transfers"];
const baseExcl = ["Flights unless mentioned", "Personal expenses", "Travel insurance", "Anything not listed under inclusions"];

function build([slug, title, dest, nights, price, off, type, rating, reviews]: Row): Tour {
  const name = allDestinations.find((d) => d.slug === dest)?.name ?? dest;
  const days = nights + 1;
  return {
    slug, title, rating, reviews, price, discountPct: off, type, nights, destination: dest,
    duration: `${nights}N / ${days}D`,
    image: img(`tour-${slug}`),
    gallery: [1, 2, 3, 4].map((n) => img(`tour-${slug}-${n}`, 1000, 700)),
    summary: `${nights} nights in ${name} with hotels, transfers and guided sightseeing. A ${type.toLowerCase()}-friendly itinerary you can customise.`,
    highlights: [`Guided ${name} city sightseeing`, "Handpicked hotels", "Private airport transfers", "Free time to explore", "24x7 MyTourbee support"],
    itinerary: Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      if (day === 1) return { day, title: `Arrive in ${name}`, text: "Meet our representative, transfer to your hotel and check in. Rest of the day at leisure." };
      if (day === days) return { day, title: "Departure", text: "Breakfast, check out and transfer to the airport with memories to take home." };
      return { day, title: `Explore ${name}, day ${day - 1}`, text: `Breakfast at the hotel, then a day of guided sightseeing across ${name}'s best-known sights, with time for shopping and local food.` };
    }),
    inclusions: baseIncl,
    exclusions: baseExcl,
    hotels: [{ name: `${name} Grand Hotel`, stars: 4 }, { name: `${name} Comfort Stay`, stars: 3 }],
  };
}

export const tours: Tour[] = rows.map(build);
export const travelTypes: TravelType[] = ["Honeymoon", "Family", "Friends", "Adventure", "Luxury"];
