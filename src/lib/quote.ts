import "server-only";
import { productService } from "@/lib/services";
import type { BookingInput } from "@/lib/booking";

export type QuoteKind = "tour" | "activity" | "cruise" | "visa";

export type Quote = {
  kind: QuoteKind;
  slug: string;
  title: string;
  image: string;
  subtitle: string;
  unitLabel: string;
  unitPrice: number;
  /** Activity ticket options or cruise cabins. */
  options?: { name: string; detail: string; price: number }[];
  /** Cruises only: the departure dates a customer can pick. */
  dates?: { value: string; label: string }[];
};

const today = () => new Date().toISOString().slice(0, 10);

/** Looks the item up in the catalogue. Prices always come from here, never from the client. */
export async function getQuote(kind: string, slug: string, option?: string): Promise<Quote | null> {
  if (kind === "tour") {
    const t = await productService.getTour(slug);
    if (!t) return null;
    return { kind: "tour", slug, title: t.title, image: t.image, subtitle: t.duration, unitLabel: "per person", unitPrice: t.price };
  }
  if (kind === "activity") {
    const a = await productService.getActivity(slug);
    if (!a) return null;
    const chosen = a.options.find((o) => o.name === option) ?? a.options[0];
    return { kind: "activity", slug, title: a.title, image: a.image, subtitle: a.duration, unitLabel: `per person · ${chosen.name}`, unitPrice: chosen.price, options: a.options };
  }
  if (kind === "cruise") {
    const c = await productService.getCruise(slug);
    if (!c) return null;
    const chosen = c.cabins.find((o) => o.name === option) ?? c.cabins[0];
    const dates = c.departures.filter((d) => d.date >= today()).map((d) => ({ value: d.date, label: d.date }));
    return {
      kind: "cruise", slug, title: c.title, image: c.image, subtitle: `${c.nights} nights · ${c.line}`, unitLabel: `per person · ${chosen.name} cabin`,
      unitPrice: chosen.price, options: c.cabins, dates,
    };
  }
  if (kind === "visa") {
    const v = await productService.getVisa(slug);
    if (!v) return null;
    return { kind: "visa", slug, title: v.title, image: v.image, subtitle: `Processing: ${v.processing}`, unitLabel: "per applicant (service price)", unitPrice: v.price };
  }
  return null;
}

export const totalFor = (q: Quote, b: Pick<BookingInput, "adults" | "children">) => q.unitPrice * (b.adults + b.children);
