export type Enquiry = {
  destinations: string[];
  otherPlace: string;
  startDate: string;
  flexible: boolean;
  nights: string;
  adults: number;
  children: number;
  styles: string[];
  budget: string;
  message: string;
  name: string;
  email: string;
  phone: string;
  contactVia: "Phone" | "WhatsApp" | "Email";
  consent: boolean;
  source: string;
  website: string; // honeypot, must stay empty
};

export const emptyEnquiry: Enquiry = {
  destinations: [], otherPlace: "", startDate: "", flexible: false, nights: "5-7", adults: 2, children: 0,
  styles: [], budget: "", message: "", name: "", email: "", phone: "", contactVia: "WhatsApp",
  consent: false, source: "", website: "",
};

export const budgets = ["Under ₹30,000", "₹30,000 – ₹60,000", "₹60,000 – ₹1,00,000", "₹1,00,000 – ₹2,00,000", "₹2,00,000+"];
export const nightOptions = ["1-3", "4-5", "5-7", "8-10", "10+"];
export const styleOptions = ["Honeymoon", "Family", "Friends", "Adventure", "Luxury", "Budget", "Cruise", "Business"];

/** Returns field → message. Shared by the form (per step) and the API route. */
export function validate(e: Enquiry, step: 1 | 2 | 3 | 4 | "all"): Record<string, string> {
  const err: Record<string, string> = {};
  const on = (s: number) => step === "all" || step === s;
  if (on(1) && !e.destinations.length && !e.otherPlace.trim()) err.destinations = "Pick at least one destination or tell us where.";
  if (on(2)) {
    if (!e.flexible && !e.startDate) err.startDate = "Choose a start date or mark your dates as flexible.";
    if (!e.flexible && e.startDate && e.startDate < new Date().toISOString().slice(0, 10)) err.startDate = "Start date can't be in the past.";
    if (!(e.adults >= 1 && e.adults <= 20)) err.adults = "At least 1 adult (max 20).";
    if (!(e.children >= 0 && e.children <= 20)) err.children = "Children must be 0–20.";
  }
  if (on(3) && !e.budget) err.budget = "Select a budget range.";
  if (on(4)) {
    if (e.name.trim().length < 2) err.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)) err.email = "Enter a valid email address.";
    if (!/^\+?[0-9 ()-]{8,16}$/.test(e.phone.trim())) err.phone = "Enter a valid phone number.";
    if (!e.consent) err.consent = "Please agree so we can contact you.";
  }
  return err;
}
