export type Destination = { slug: string; name: string; tours: number; image: string };
export type Deal = {
  slug: string; title: string; rating: number; duration: string;
  price: number; discountPct: number; image: string;
};
export type Activity = {
  slug: string; title: string; rating: number; reviews: number;
  duration: string; price: number; image: string;
};
export type Review = { name: string; city: string; trip: string; text: string };
export type Post = { slug: string; title: string; image: string; excerpt?: string; body?: string } & Seo;

export type Seo = { metaTitle?: string; metaDescription?: string; published?: boolean };

export type TravelType = "Honeymoon" | "Family" | "Friends" | "Adventure" | "Luxury";
export type Tour = Deal & {
  destination: string; // destination slug
  nights: number;
  reviews: number;
  type: TravelType;
  summary: string;
  highlights: string[];
  itinerary: { day: number; title: string; text: string }[];
  inclusions: string[];
  exclusions: string[];
  hotels: { name: string; stars: number }[];
  gallery: string[];
} & Seo;

export type ActivityCategory =
  | "Attractions" | "Theme Parks" | "Adventures" | "Cruises"
  | "Food Experiences" | "City Tours" | "Water Activities" | "Shows & Events";
export type ActivityFull = Activity & {
  destination: string; // destination slug
  category: ActivityCategory;
  summary: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  options: { name: string; detail: string; price: number }[];
  gallery: string[];
  faqs: { q: string; a: string }[];
} & Seo;

export type SiteSettings = {
  phone: string; whatsapp: string; email: string; address: string; hours: string;
  instagram: string; facebook: string; youtube: string;
};
export const defaultSettings: SiteSettings = {
  phone: "+91 XXXXX XXXXX", whatsapp: "", email: "hello@mytourbee.com", address: "",
  hours: "Mon–Sat, 9:00 am – 7:00 pm IST", instagram: "", facebook: "", youtube: "",
};

export type InfoPage = {
  slug: string; title: string; intro: string; updated: string;
  sections: { heading: string; body: string }[];
  faqs: { category: string; q: string; a: string }[];
} & Seo;

export type CruiseLine = "Cordelia" | "MSC" | "Royal Caribbean" | "Disney" | "Other";
export type Cruise = {
  slug: string; title: string; line: CruiseLine; ship: string; route: string; departurePort: string;
  nights: number; price: number; rating: number; reviews: number; image: string; gallery: string[]; summary: string;
  highlights: string[];
  itinerary: { day: number; title: string; text: string }[];
  departures: { date: string; note: string }[];
  cabins: { name: string; detail: string; price: number }[];
  inclusions: string[]; exclusions: string[];
} & Seo;

export type VisaType = "Tourist" | "Business" | "Transit";
export type Visa = {
  slug: string; country: string; title: string; type: VisaType; processing: string; validity: string; stay: string;
  entry: "Single" | "Multiple"; price: number; image: string; summary: string;
  requirements: string[];
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
} & Seo;
