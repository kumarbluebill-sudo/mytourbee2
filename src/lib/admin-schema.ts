import { activityCategoryList } from "@/data/activities";
import { cruiseLines } from "@/data/cruises";
import { regions } from "@/data/destinations";
import { travelTypes } from "@/data/tours";
import { IMAGE_HOSTS } from "@/lib/image-hosts";
import { EMAIL_RE } from "@/lib/enquiry-rules";

/**
 * One schema per editable thing. The admin form renders from it and the API
 * sanitises incoming data with the same definition, so they can't drift apart.
 */
export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "url" | "image"; required?: boolean; help?: string; max?: number }
  | { key: string; label: string; type: "date"; required?: boolean; help?: string }
  | { key: string; label: string; type: "number"; required?: boolean; min?: number; max?: number; step?: number; int?: boolean; help?: string }
  | { key: string; label: string; type: "select"; options: readonly string[] | "destinations"; required?: boolean; help?: string }
  | { key: string; label: string; type: "checkbox"; help?: string }
  | { key: string; label: string; type: "lines" | "images"; help?: string }
  | { key: string; label: string; type: "rows"; fields: Field[]; help?: string };

export type EntityKind = "destination" | "tour" | "activity" | "post" | "cruise" | "visa" | "settings";

/** A wizard step: a title and the top-level field keys shown on it. */
export type Step = { title: string; keys: string[]; hint?: string };
export type Schema = { kind: EntityKind; label: string; plural: string; titleKey: string; publicPath: string; fields: Field[]; steps?: Step[] };

const faqs: Field = { key: "faqs", label: "FAQs", type: "rows", fields: [{ key: "q", label: "Question", type: "text", required: true }, { key: "a", label: "Answer", type: "textarea", required: true }] };

const seo: Field[] = [
  { key: "metaTitle", label: "Page title for Google", type: "text", help: "Leave blank to use the default. About 50–60 characters works best." },
  { key: "metaDescription", label: "Description for Google", type: "textarea", max: 300, help: "One or two sentences, up to about 155 characters." },
];
const published: Field = { key: "published", label: "Published (visible on the website)", type: "checkbox", help: "Untick to keep it as a draft that only you can see here." };
const seoStep: Step = { title: "SEO", keys: ["metaTitle", "metaDescription"], hint: "How this page looks in search results. Optional." };
const publishStep: Step = { title: "Publish", keys: ["published"], hint: "Review and publish." };

export const schemas: Record<EntityKind, Schema> = {
  destination: {
    kind: "destination", label: "Destination", plural: "Destinations", titleKey: "name", publicPath: "destinations",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "region", label: "Region", type: "select", options: regions, required: true },
      { key: "tours", label: "Tours count shown on cards", type: "number", min: 0, max: 9999, int: true, required: true },
      { key: "trending", label: "Show in Trending Now on the homepage", type: "checkbox" },
      { key: "bestTime", label: "Best time to visit", type: "text", required: true },
      { key: "overview", label: "Overview", type: "textarea", required: true },
      { key: "image", label: "Cover image", type: "image", required: true },
      { key: "hotels", label: "Where to stay", type: "rows", fields: [
        { key: "name", label: "Hotel", type: "text", required: true },
        { key: "stars", label: "Stars", type: "number", min: 1, max: 5, int: true, required: true },
        { key: "area", label: "Area", type: "text" },
      ] },
      faqs, ...seo, published,
    ],
    steps: [
      { title: "Basic information", keys: ["name", "region", "tours", "bestTime", "trending", "overview"] },
      { title: "Images", keys: ["image"] },
      { title: "Stay & FAQs", keys: ["hotels", "faqs"] },
      seoStep, publishStep,
    ],
  },
  tour: {
    kind: "tour", label: "Tour package", plural: "Tour packages", titleKey: "title", publicPath: "tours",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "destination", label: "Destination", type: "select", options: "destinations", required: true },
      { key: "type", label: "Travel type", type: "select", options: travelTypes, required: true },
      { key: "nights", label: "Nights", type: "number", min: 1, max: 60, int: true, required: true, help: "Days are nights + 1." },
      { key: "summary", label: "Overview", type: "textarea", required: true },
      { key: "image", label: "Card image", type: "image", required: true },
      { key: "gallery", label: "Gallery images", type: "images", help: "First image is the large photo on the page." },
      { key: "highlights", label: "Highlights", type: "lines", help: "One per line." },
      { key: "itinerary", label: "Day-by-day itinerary", type: "rows", help: "Days are numbered in order.", fields: [
        { key: "title", label: "Day title", type: "text", required: true },
        { key: "text", label: "Details", type: "textarea", required: true },
      ] },
      { key: "hotels", label: "Hotels", type: "rows", fields: [
        { key: "name", label: "Hotel", type: "text", required: true },
        { key: "stars", label: "Stars", type: "number", min: 1, max: 5, int: true, required: true },
      ] },
      { key: "price", label: "Price per person (₹, after discount)", type: "number", min: 1, max: 10000000, int: true, required: true },
      { key: "discountPct", label: "Discount %", type: "number", min: 0, max: 90, int: true, required: true, help: "0 hides the discount badge." },
      { key: "rating", label: "Rating (0–5)", type: "number", min: 0, max: 5, step: 0.1, required: true },
      { key: "reviews", label: "Review count shown", type: "number", min: 0, max: 1000000, int: true, required: true },
      { key: "inclusions", label: "Inclusions", type: "lines", help: "One per line." },
      { key: "exclusions", label: "Exclusions", type: "lines", help: "One per line." },
      ...seo, published,
    ],
    steps: [
      { title: "Basic information", keys: ["title", "destination", "type", "nights", "summary"] },
      { title: "Images", keys: ["image", "gallery"] },
      { title: "Itinerary", keys: ["highlights", "itinerary", "hotels"] },
      { title: "Pricing", keys: ["price", "discountPct", "rating", "reviews"] },
      { title: "Inclusions", keys: ["inclusions", "exclusions"] },
      seoStep, publishStep,
    ],
  },
  activity: {
    kind: "activity", label: "Activity", plural: "Things To Do", titleKey: "title", publicPath: "things-to-do",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "destination", label: "Destination", type: "select", options: "destinations", required: true },
      { key: "category", label: "Category", type: "select", options: activityCategoryList, required: true },
      { key: "duration", label: "Duration (text)", type: "text", required: true, help: "e.g. 6 Hours" },
      { key: "summary", label: "Description", type: "textarea", required: true },
      { key: "image", label: "Card image", type: "image", required: true },
      { key: "gallery", label: "Gallery images", type: "images" },
      { key: "highlights", label: "Highlights", type: "lines", help: "One per line." },
      { key: "included", label: "Included", type: "lines" },
      { key: "notIncluded", label: "Not included", type: "lines" },
      faqs,
      { key: "price", label: "From price (₹)", type: "number", min: 1, max: 10000000, int: true, required: true },
      { key: "options", label: "Ticket options", type: "rows", help: "At least one. The first is the default.", fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "detail", label: "Detail", type: "text" },
        { key: "price", label: "Price (₹)", type: "number", min: 1, max: 10000000, int: true, required: true },
      ] },
      { key: "rating", label: "Rating (0–5)", type: "number", min: 0, max: 5, step: 0.1, required: true },
      { key: "reviews", label: "Review count shown", type: "number", min: 0, max: 10000000, int: true, required: true },
      ...seo, published,
    ],
    steps: [
      { title: "Basic information", keys: ["title", "destination", "category", "duration", "summary"] },
      { title: "Images", keys: ["image", "gallery"] },
      { title: "Details", keys: ["highlights", "included", "notIncluded", "faqs"] },
      { title: "Pricing", keys: ["price", "options", "rating", "reviews"] },
      seoStep, publishStep,
    ],
  },
  post: {
    kind: "post", label: "Travel guide", plural: "Travel guides", titleKey: "title", publicPath: "guide",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "excerpt", label: "Short summary", type: "textarea", max: 400 },
      { key: "image", label: "Cover image", type: "image", required: true },
      { key: "body", label: "Article", type: "textarea", max: 20000, help: "Leave a blank line between paragraphs." },
      ...seo, published,
    ],
    steps: [
      { title: "Basic information", keys: ["title", "excerpt"] },
      { title: "Images", keys: ["image"] },
      { title: "Article", keys: ["body"] },
      seoStep, publishStep,
    ],
  },
  cruise: {
    kind: "cruise", label: "Cruise", plural: "Cruises", titleKey: "title", publicPath: "cruises",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "line", label: "Cruise line", type: "select", options: cruiseLines, required: true },
      { key: "ship", label: "Ship", type: "text", required: true },
      { key: "route", label: "Route", type: "text", required: true, help: "e.g. Mumbai → Goa → Mumbai" },
      { key: "departurePort", label: "Departure port", type: "text", required: true },
      { key: "nights", label: "Nights", type: "number", min: 1, max: 60, int: true, required: true },
      { key: "summary", label: "Overview", type: "textarea", required: true },
      { key: "image", label: "Card image", type: "image", required: true },
      { key: "gallery", label: "Gallery images", type: "images" },
      { key: "highlights", label: "Highlights", type: "lines", help: "One per line." },
      { key: "itinerary", label: "Itinerary", type: "rows", help: "Days are numbered in order.", fields: [
        { key: "title", label: "Day / port", type: "text", required: true },
        { key: "text", label: "Details", type: "textarea", required: true },
      ] },
      { key: "departures", label: "Departure dates", type: "rows", help: "Only future dates are shown to customers.", fields: [
        { key: "date", label: "Date", type: "date", required: true },
        { key: "note", label: "Note", type: "text" },
      ] },
      { key: "cabins", label: "Cabins", type: "rows", help: "The cheapest cabin sets the 'from' price.", fields: [
        { key: "name", label: "Cabin", type: "text", required: true },
        { key: "detail", label: "Detail", type: "text" },
        { key: "price", label: "Price per person (₹)", type: "number", min: 1, max: 10000000, int: true, required: true },
      ] },
      { key: "rating", label: "Rating (0–5)", type: "number", min: 0, max: 5, step: 0.1, required: true },
      { key: "reviews", label: "Review count shown", type: "number", min: 0, max: 1000000, int: true, required: true },
      { key: "inclusions", label: "Inclusions", type: "lines" },
      { key: "exclusions", label: "Exclusions", type: "lines" },
      ...seo, published,
    ],
    steps: [
      { title: "Basic information", keys: ["title", "line", "ship", "route", "departurePort", "nights", "summary"] },
      { title: "Images", keys: ["image", "gallery"] },
      { title: "Itinerary", keys: ["highlights", "itinerary"] },
      { title: "Dates & cabins", keys: ["departures", "cabins", "rating", "reviews"] },
      { title: "Inclusions", keys: ["inclusions", "exclusions"] },
      seoStep, publishStep,
    ],
  },
  visa: {
    kind: "visa", label: "Visa service", plural: "Visa services", titleKey: "title", publicPath: "visa",
    fields: [
      { key: "country", label: "Country", type: "text", required: true },
      { key: "title", label: "Title", type: "text", required: true, help: "e.g. Dubai Tourist Visa" },
      { key: "type", label: "Visa type", type: "select", options: ["Tourist", "Business", "Transit"], required: true },
      { key: "summary", label: "Overview", type: "textarea", required: true },
      { key: "image", label: "Image", type: "image", required: true },
      { key: "processing", label: "Processing time", type: "text", required: true, help: "e.g. 3–5 working days" },
      { key: "validity", label: "Validity", type: "text", required: true },
      { key: "stay", label: "Length of stay", type: "text", required: true },
      { key: "entry", label: "Entry", type: "select", options: ["Single", "Multiple"], required: true },
      { key: "price", label: "Service price per applicant (₹)", type: "number", min: 1, max: 10000000, int: true, required: true },
      { key: "requirements", label: "Documents required", type: "lines", help: "One per line." },
      { key: "steps", label: "How it works", type: "rows", fields: [
        { key: "title", label: "Step", type: "text", required: true },
        { key: "text", label: "Details", type: "textarea", required: true },
      ] },
      faqs, ...seo, published,
    ],
    steps: [
      { title: "Basic information", keys: ["country", "title", "type", "summary"] },
      { title: "Images", keys: ["image"] },
      { title: "Rules & price", keys: ["processing", "validity", "stay", "entry", "price"] },
      { title: "Documents & steps", keys: ["requirements", "steps", "faqs"] },
      seoStep, publishStep,
    ],
  },
  settings: {
    kind: "settings", label: "Site settings", plural: "Site settings", titleKey: "email", publicPath: "",
    fields: [
      { key: "phone", label: "Phone (shown on the site)", type: "text", required: true },
      { key: "whatsapp", label: "WhatsApp number", type: "text", help: "Digits with country code, e.g. 919876543210. Leave blank to hide." },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "address", label: "Office address", type: "textarea" },
      { key: "hours", label: "Support hours", type: "text" },
      { key: "instagram", label: "Instagram URL", type: "url" },
      { key: "facebook", label: "Facebook URL", type: "url" },
      { key: "youtube", label: "YouTube URL", type: "url" },
    ],
  },
};

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isAllowedImage(v: string) {
  if (/^\/media\/[a-z0-9-]+\.(jpg|png|webp)$/.test(v)) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

type Errors = Record<string, string>;

function clean(fields: Field[], input: unknown, errors: Errors, path: string, destinations: string[]): Record<string, unknown> {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const p = path ? `${path}.${f.key}` : f.key;
    const v = src[f.key];
    switch (f.type) {
      case "text": case "textarea": case "url": case "image": {
        const str = typeof v === "string" ? v.trim() : "";
        const max = f.type === "text" ? 300 : f.type === "textarea" ? (f.max ?? 5000) : 500;
        if (str.length > max) errors[p] = `Keep this under ${max} characters.`;
        else if (f.required && !str) errors[p] = "Required.";
        else if (f.type === "image" && str && !isAllowedImage(str)) errors[p] = `Use an uploaded image, or an https link from: ${IMAGE_HOSTS.join(", ")}.`;
        else if (f.type === "url" && str && !/^https:\/\/\S+$/.test(str)) errors[p] = "Enter a full https:// link.";
        out[f.key] = str;
        break;
      }
      case "date": {
        const str = typeof v === "string" ? v.trim() : "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(str) || Number.isNaN(Date.parse(str))) errors[p] = f.required ? "Choose a valid date." : "Invalid date.";
        out[f.key] = str;
        break;
      }
      case "number": {
        const n = typeof v === "number" ? v : Number(v);
        if (v === "" || v === null || v === undefined || !Number.isFinite(n)) { if (f.required) errors[p] = "Enter a number."; out[f.key] = 0; break; }
        if ((f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) errors[p] = `Must be between ${f.min ?? "-∞"} and ${f.max ?? "∞"}.`;
        else if (f.int && !Number.isInteger(n)) errors[p] = "Whole numbers only.";
        out[f.key] = n;
        break;
      }
      case "select": {
        const str = typeof v === "string" ? v : "";
        const opts = f.options === "destinations" ? destinations : f.options;
        if (!opts.includes(str)) errors[p] = "Choose a valid option.";
        out[f.key] = str;
        break;
      }
      case "checkbox":
        out[f.key] = v === true;
        break;
      case "lines": case "images": {
        const arr = Array.isArray(v) ? v : [];
        const items = arr.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
        if (items.length > 30) errors[p] = "Too many items (max 30).";
        if (f.type === "lines" && items.some((x) => x.length > 300)) errors[p] = "Each line must be under 300 characters.";
        if (f.type === "images" && items.some((x) => !isAllowedImage(x))) errors[p] = `Each image must be an upload or an https link from: ${IMAGE_HOSTS.join(", ")}.`;
        out[f.key] = items;
        break;
      }
      case "rows": {
        const arr = Array.isArray(v) ? v : [];
        if (arr.length > 40) { errors[p] = "Too many rows (max 40)."; out[f.key] = []; break; }
        out[f.key] = arr.map((row, i) => clean(f.fields, row, errors, `${p}.${i}`, destinations));
        break;
      }
    }
  }
  return out;
}

export type SanitizeResult = { data: Record<string, unknown>; errors: Errors };

/** Validates and normalises an item. `destinations` is the list of valid destination slugs. */
export function sanitize(kind: EntityKind, input: unknown, slug: string, destinations: string[]): SanitizeResult {
  const errors: Errors = {};
  const data = clean(schemas[kind].fields, input, errors, "", destinations);
  const str = (k: string) => String(data[k] ?? "");

  if (kind === "settings") {
    if (!EMAIL_RE.test(str("email"))) errors.email = "Enter a valid email address.";
    if (str("whatsapp") && !/^\d{8,15}$/.test(str("whatsapp"))) errors.whatsapp = "Digits only, with country code (8–15 digits).";
    return { data, errors };
  }

  data.slug = slug;
  if (kind === "destination") {
    data.region = str("region");
  }
  if (kind === "tour") {
    const nights = Number(data.nights);
    data.duration = `${nights}N / ${nights + 1}D`;
    data.itinerary = (data.itinerary as { title: string; text: string }[]).map((d, i) => ({ day: i + 1, ...d }));
    const gallery = data.gallery as string[];
    if (!gallery.length && str("image")) data.gallery = [str("image")];
    if (!(data.itinerary as unknown[]).length) errors.itinerary = "Add at least one day.";
  }
  if (kind === "activity") {
    const gallery = data.gallery as string[];
    if (!gallery.length && str("image")) data.gallery = [str("image")];
    if (!(data.options as unknown[]).length) errors.options = "Add at least one ticket option.";
  }
  if (kind === "post") data.body = str("body");
  if (kind === "cruise") {
    const cabins = data.cabins as { price: number }[];
    if (!cabins.length) errors.cabins = "Add at least one cabin.";
    else data.price = Math.min(...cabins.map((c) => c.price));
    if (!(data.departures as unknown[]).length) errors.departures = "Add at least one departure date.";
    data.itinerary = (data.itinerary as { title: string; text: string }[]).map((d, i) => ({ day: i + 1, ...d }));
    if (!(data.itinerary as unknown[]).length) errors.itinerary = "Add at least one day.";
    const gallery = data.gallery as string[];
    if (!gallery.length && str("image")) data.gallery = [str("image")];
  }
  return { data, errors };
}
