import type { Activity, Deal, Destination, Post, Review } from "./types";

const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const dest = (name: string, tours: number): Destination => ({
  slug: name.toLowerCase(), name, tours, image: img(`tb-${name}`),
});

export const trending = ["Dubai", "Switzerland", "Singapore", "Bali"].map((n, i) =>
  dest(n, [120, 85, 96, 74][i]),
);
export const domestic = ["Kerala", "Kashmir", "Goa", "Rajasthan", "Himachal", "Andaman"].map((n, i) =>
  dest(n, [64, 41, 58, 47, 39, 22][i]),
);
export const international = [
  "Dubai", "Singapore", "Thailand", "Malaysia", "Switzerland", "Europe", "Japan", "Australia",
].map((n, i) => dest(n, [120, 96, 88, 54, 85, 110, 36, 29][i]));

export const deals: Deal[] = [
  { slug: "dubai-escape", title: "Dubai Escape", rating: 4.8, duration: "5N / 6D", price: 49999, discountPct: 20, image: img("deal-dubai") },
  { slug: "swiss-alps", title: "Swiss Alps Classic", rating: 4.9, duration: "6N / 7D", price: 139999, discountPct: 15, image: img("deal-swiss") },
  { slug: "singapore-fun", title: "Singapore Family Fun", rating: 4.7, duration: "4N / 5D", price: 64999, discountPct: 18, image: img("deal-sg") },
  { slug: "bali-bliss", title: "Bali Bliss", rating: 4.8, duration: "5N / 6D", price: 54999, discountPct: 25, image: img("deal-bali") },
];

export const activities: Activity[] = [
  { slug: "dubai-desert-safari", title: "Dubai Desert Safari", rating: 4.8, reviews: 2431, duration: "6 Hours", price: 2499, image: img("act-safari") },
  { slug: "burj-khalifa", title: "Burj Khalifa At The Top", rating: 4.7, reviews: 5120, duration: "2 Hours", price: 3299, image: img("act-burj") },
  { slug: "universal-sg", title: "Universal Studios Singapore", rating: 4.8, reviews: 3890, duration: "Full day", price: 5199, image: img("act-uss") },
  { slug: "dhow-cruise", title: "Dubai Marina Dhow Cruise", rating: 4.6, reviews: 1760, duration: "2 Hours", price: 1899, image: img("act-dhow") },
];

export const activityCategories = [
  ["🏛️", "Attractions"], ["🎢", "Theme Parks"], ["🏜️", "Adventures"], ["🚢", "Cruises"],
  ["🍽️", "Food Experiences"], ["🏙️", "City Tours"], ["🏖️", "Water Activities"], ["🎭", "Shows & Events"],
];

export const quickCategories = [
  ["🧳", "Tours"], ["🎟️", "Things To Do"], ["🌍", "International"], ["🇮🇳", "Domestic"],
  ["🚢", "Cruises"], ["🏨", "Hotels"], ["✈️", "Flights"], ["🛂", "Visa"],
];

export const interests = [
  ["💕", "Honeymoon"], ["👨‍👩‍👧", "Family"], ["🧑‍🤝‍🧑", "Friends"], ["🏔️", "Adventure"],
  ["💎", "Luxury"], ["💰", "Budget"], ["🚢", "Cruise"], ["💼", "Business"],
];

export const reviews: Review[] = [
  { name: "Priya R.", city: "Coimbatore", trip: "Dubai Family Holiday", text: "Amazing experience from start to finish." },
  { name: "Arun K.", city: "Chennai", trip: "Switzerland Honeymoon", text: "Every detail was handled. We just enjoyed the trip." },
  { name: "Meena S.", city: "Bengaluru", trip: "Singapore Getaway", text: "Great value and a very helpful travel expert." },
];

export const posts: Post[] = [
  { slug: "switzerland", title: "10 Best Places to Visit in Switzerland", image: img("blog-swiss") },
  { slug: "dubai-guide", title: "Dubai Travel Guide", image: img("blog-dubai") },
  { slug: "honeymoon", title: "Best Honeymoon Destinations", image: img("blog-honey") },
  { slug: "singapore-5d", title: "Singapore 5-Day Itinerary", image: img("blog-sg") },
];

export const trendingSearches = ["Dubai", "Switzerland", "Singapore", "Bali", "Europe"];
