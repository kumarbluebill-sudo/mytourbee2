import type { Visa, VisaType } from "./types";

const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

type Row = [slug: string, country: string, type: VisaType, processing: string, validity: string, stay: string, entry: "Single" | "Multiple", fee: number];

// Sample content only. Processing times, validity and fees are placeholders:
// confirm each against the current official rules before publishing real values in /admin.
const rows: Row[] = [
  ["dubai-tourist-visa", "Dubai (UAE)", "Tourist", "3–5 working days", "60 days", "30 days", "Single", 6500],
  ["singapore-tourist-visa", "Singapore", "Tourist", "4–6 working days", "2 years", "30 days", "Multiple", 3500],
  ["thailand-tourist-visa", "Thailand", "Tourist", "5–7 working days", "6 months", "60 days", "Single", 3000],
  ["malaysia-tourist-visa", "Malaysia", "Tourist", "3–5 working days", "3 months", "30 days", "Single", 2500],
  ["schengen-tourist-visa", "Europe (Schengen)", "Tourist", "15–30 working days", "As granted", "Up to 90 days", "Multiple", 9500],
  ["japan-tourist-visa", "Japan", "Tourist", "7–10 working days", "90 days", "15 days", "Single", 4500],
  ["australia-tourist-visa", "Australia", "Tourist", "20–30 working days", "As granted", "Up to 3 months", "Multiple", 11000],
  ["uk-tourist-visa", "United Kingdom", "Tourist", "15–25 working days", "6 months", "Up to 6 months", "Multiple", 12500],
];

export const visas: Visa[] = rows.map(([slug, country, type, processing, validity, stay, entry, price]) => ({
  slug, country, title: `${country} ${type} Visa`, type, processing, validity, stay, entry, price,
  image: img(`visa-${slug}`),
  summary: `We help you prepare and submit your ${country} ${type.toLowerCase()} visa application, check your documents and keep you updated until a decision.`,
  requirements: [
    "Passport valid for at least 6 months, with blank pages",
    "Recent passport-size photographs",
    "Confirmed travel itinerary and accommodation details",
    "Proof of funds such as recent bank statements",
    "Proof of employment or business, such as an employer letter",
    "Any extra documents the embassy asks for (our team will tell you)",
  ],
  steps: [
    { title: "Apply with MyTourbee", text: "Send your details and travel dates. Our team checks which visa you need." },
    { title: "Share documents", text: "We tell you exactly what is needed and review your documents before submission." },
    { title: "We submit", text: "We prepare and submit your application and keep you updated." },
    { title: "Receive your visa", text: "Once approved you receive your visa so you can travel." },
  ],
  faqs: [
    { q: "Is approval guaranteed?", a: "No. The decision is always made by the embassy or consulate. We check your documents to give your application the best chance." },
    { q: "Can I apply for a group or family?", a: "Yes. Add the number of applicants when you apply and we will guide you on documents for each person." },
    { q: "When do I pay?", a: "Our team confirms the requirements first and then sends you a secure payment link. You are not charged when you submit the request." },
    { q: "Are government fees included?", a: "The price shown is MyTourbee's service price. Official fees and any embassy charges are confirmed before you pay." },
  ],
}));
