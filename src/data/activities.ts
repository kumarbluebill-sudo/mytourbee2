import { allDestinations } from "./destinations";
import type { ActivityCategory, ActivityFull } from "./types";

const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const activityCategoryList: ActivityCategory[] = [
  "Attractions", "Theme Parks", "Adventures", "Cruises", "Food Experiences", "City Tours", "Water Activities", "Shows & Events",
];

type Row = [slug: string, title: string, dest: string, cat: ActivityCategory, duration: string, price: number, rating: number, reviews: number];

const rows: Row[] = [
  ["dubai-desert-safari", "Dubai Desert Safari", "dubai", "Adventures", "6 Hours", 2499, 4.8, 2431],
  ["burj-khalifa", "Burj Khalifa At The Top", "dubai", "Attractions", "2 Hours", 3299, 4.7, 5120],
  ["universal-sg", "Universal Studios Singapore", "singapore", "Theme Parks", "Full day", 5199, 4.8, 3890],
  ["dhow-cruise", "Dubai Marina Dhow Cruise", "dubai", "Cruises", "2 Hours", 1899, 4.6, 1760],
  ["ferrari-world", "Ferrari World Abu Dhabi", "dubai", "Theme Parks", "Full day", 6499, 4.7, 2210],
  ["dubai-city-tour", "Dubai Half-Day City Tour", "dubai", "City Tours", "5 Hours", 1599, 4.5, 980],
  ["la-perle-show", "La Perle by Dragone", "dubai", "Shows & Events", "2 Hours", 6999, 4.8, 1320],
  ["singapore-night-safari", "Singapore Night Safari", "singapore", "Attractions", "3 Hours", 3099, 4.7, 1840],
  ["gardens-by-the-bay", "Gardens by the Bay", "singapore", "Attractions", "3 Hours", 2299, 4.8, 2660],
  ["sentosa-water", "Sentosa Water Adventure", "singapore", "Water Activities", "4 Hours", 2799, 4.6, 870],
  ["bali-rafting", "Ayung River Rafting", "bali", "Adventures", "4 Hours", 2999, 4.7, 1120],
  ["bali-food-tour", "Ubud Street Food Tour", "bali", "Food Experiences", "3 Hours", 1799, 4.8, 640],
  ["phuket-island-hopping", "Phuket Island Hopping", "thailand", "Water Activities", "8 Hours", 3499, 4.6, 1430],
  ["alleppey-houseboat", "Alleppey Houseboat Cruise", "kerala", "Cruises", "1 Day", 6999, 4.8, 760],
  ["goa-water-sports", "Goa Water Sports Combo", "goa", "Water Activities", "3 Hours", 1999, 4.5, 1010],
  ["jungfraujoch", "Jungfraujoch Top of Europe", "switzerland", "Attractions", "Full day", 11999, 4.9, 900],
];

function build([slug, title, dest, category, duration, price, rating, reviews]: Row): ActivityFull {
  const place = allDestinations.find((d) => d.slug === dest)?.name ?? dest;
  return {
    slug, title, rating, reviews, duration, price, category, destination: dest,
    image: img(`act-${slug}`),
    gallery: [1, 2, 3, 4].map((n) => img(`act-${slug}-${n}`, 1000, 700)),
    summary: `${title} is one of the most popular things to do in ${place}. Book online, choose your option and go with confidence.`,
    highlights: ["Instant confirmation", "Experienced local guides", "Flexible options for every budget", "Free cancellation up to 24 hours before"],
    included: ["Entry or ticket as per option", "Guide or host where mentioned", "Taxes and service charges"],
    notIncluded: ["Hotel pickup unless selected", "Meals unless mentioned", "Personal expenses and tips"],
    options: [
      { name: "Standard", detail: "Shared experience", price },
      { name: "Premium", detail: "Priority access and extras", price: Math.round((price * 1.4) / 50) * 50 },
      { name: "Private", detail: "Exclusive for your group", price: Math.round((price * 2.2) / 50) * 50 },
    ],
    faqs: [
      { q: "How do I receive my ticket?", a: "Your voucher is sent by email and available in My Account once the booking is confirmed." },
      { q: "Can I cancel or change my date?", a: "Yes. You can cancel free of charge up to 24 hours before the start time." },
      { q: "Is it suitable for children?", a: "Most options are family friendly. Age and height rules are shown on the voucher." },
    ],
  };
}

export const activitiesFull: ActivityFull[] = rows.map(build);
