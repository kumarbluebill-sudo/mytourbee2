import type { Cruise, CruiseLine } from "./types";

const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const cruiseLines: CruiseLine[] = ["Cordelia", "MSC", "Royal Caribbean", "Disney", "Other"];

type Row = [slug: string, title: string, line: CruiseLine, ship: string, route: string, port: string, nights: number, interior: number, rating: number, reviews: number];

// Sample content: ships, routes, dates and prices are placeholders until real inventory is entered in /admin.
const rows: Row[] = [
  ["cordelia-mumbai-goa", "Mumbai to Goa Coastal Cruise", "Cordelia", "Empress", "Mumbai → Goa → Mumbai", "Mumbai", 3, 28999, 4.5, 412],
  ["cordelia-lakshadweep", "Lakshadweep Island Cruise", "Cordelia", "Empress", "Mumbai → Lakshadweep → Mumbai", "Mumbai", 5, 46999, 4.6, 268],
  ["msc-singapore-thailand", "Singapore & Thailand Cruise", "MSC", "MSC Ship (sample)", "Singapore → Penang → Phuket → Singapore", "Singapore", 4, 62999, 4.6, 190],
  ["msc-mediterranean", "Western Mediterranean Cruise", "MSC", "MSC Ship (sample)", "Barcelona → Marseille → Genoa → Rome → Barcelona", "Barcelona", 7, 119999, 4.7, 154],
  ["royal-caribbean-asia", "Royal Caribbean Asia Escape", "Royal Caribbean", "RC Ship (sample)", "Singapore → Langkawi → Phuket → Singapore", "Singapore", 5, 84999, 4.8, 231],
  ["disney-bahamas", "Disney Bahamas Family Cruise", "Disney", "Disney Ship (sample)", "Port Canaveral → Nassau → Castaway Cay → Port Canaveral", "Port Canaveral", 4, 189999, 4.9, 97],
];

const days = (n: number, route: string) => {
  const stops = route.split("→").map((s) => s.trim());
  return Array.from({ length: n + 1 }, (_, i) => {
    const day = i + 1;
    const stop = stops[Math.min(i, stops.length - 1)];
    if (day === 1) return { day, title: `Embark at ${stops[0]}`, text: "Check in, board the ship and settle into your cabin. Sail away in the evening." };
    if (day === n + 1) return { day, title: `Disembark at ${stops[stops.length - 1]}`, text: "Breakfast on board, then disembark and head home with memories." };
    return { day, title: stop === stops[0] ? "At sea" : `Explore ${stop}`, text: `A day to enjoy the ship's dining and entertainment${stop === stops[0] ? "" : `, with time ashore at ${stop}`}.` };
  });
};

const nextDates = () => [30, 60, 90].map((offset) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return { date: d.toISOString().slice(0, 10), note: "Sample departure" };
});

export const cruises: Cruise[] = rows.map(([slug, title, line, ship, route, port, nights, interior, rating, reviews]) => ({
  slug, title, line, ship, route, departurePort: port, nights, price: interior, rating, reviews,
  image: img(`cruise-${slug}`),
  gallery: [1, 2, 3, 4].map((n) => img(`cruise-${slug}-${n}`, 1000, 700)),
  summary: `${nights} nights on board ${ship}, sailing ${route}. Meals, entertainment and port stops are part of the experience.`,
  highlights: ["Meals on board", "Live shows and entertainment", "Pool deck and activities", "Port stops with free time ashore"],
  itinerary: days(nights, route),
  departures: nextDates(),
  cabins: [
    { name: "Interior", detail: "No window, best value", price: interior },
    { name: "Ocean View", detail: "Window with sea views", price: Math.round((interior * 1.25) / 100) * 100 },
    { name: "Balcony", detail: "Private balcony", price: Math.round((interior * 1.6) / 100) * 100 },
    { name: "Suite", detail: "Extra space and priority services", price: Math.round((interior * 2.4) / 100) * 100 },
  ],
  inclusions: ["Cabin accommodation", "Main meals on board", "Entertainment and shows", "Port charges and taxes as listed"],
  exclusions: ["Flights unless mentioned", "Shore excursions", "Specialty dining and drinks", "Gratuities and personal expenses"],
}));
