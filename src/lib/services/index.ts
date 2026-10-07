import "server-only";
import { reviews as sampleReviews } from "@/data/mytourbee";
import { defaultSettings, type ActivityFull, type Cruise, type InfoPage, type Visa, type Post, type Review, type SiteSettings, type Tour } from "@/data/types";
import type { DestinationDetail } from "@/data/destinations";
import { db } from "@/lib/db";
import { getCatalog, listCatalog } from "@/lib/store/catalog";
import type { ProductService } from "./product-service";

/** Drafts (published === false) never reach the public site. Older items have no flag and count as published. */
const live = <T extends { published?: boolean }>(x: T) => x.published !== false;
const onlyLive = <T extends { published?: boolean }>(x: T | undefined) => (x && live(x) ? x : undefined);
const dests = () => listCatalog<DestinationDetail>("destination").filter(live);

/** MyTourbee-managed catalogue, stored in the local database and edited from /admin. */
const mytourbee: ProductService = {
  getTrendingDestinations: async () => {
    const all = dests();
    const flagged = all.filter((d) => d.trending);
    return (flagged.length ? flagged : all).slice(0, 4);
  },
  getDomesticDestinations: async () => dests().filter((d) => d.region === "India"),
  getInternationalDestinations: async () => dests().filter((d) => d.region !== "India"),
  getAllDestinations: async () => dests(),
  getDestination: async (slug) => onlyLive(getCatalog<DestinationDetail>("destination", slug)),
  getTours: async () => listCatalog<Tour>("tour").filter(live),
  getTour: async (slug) => onlyLive(getCatalog<Tour>("tour", slug)),
  getDeals: async () =>
    listCatalog<Tour>("tour").filter((t) => live(t) && t.discountPct > 0).sort((a, b) => b.discountPct - a.discountPct).slice(0, 4),
  getActivities: async () => listCatalog<ActivityFull>("activity").filter(live),
  getActivity: async (slug) => onlyLive(getCatalog<ActivityFull>("activity", slug)),
  getReviews: async (slug) => {
    const rows = slug
      ? db().prepare("SELECT name, city, title, text FROM reviews WHERE status='approved' AND slug=? ORDER BY created_at DESC LIMIT 20").all(slug)
      : db().prepare("SELECT name, city, title, text FROM reviews WHERE status='approved' ORDER BY created_at DESC LIMIT 20").all();
    const real: Review[] = rows.map((r) => ({ name: String(r.name), city: String(r.city), trip: String(r.title), text: String(r.text) }));
    return real.length ? real : sampleReviews;
  },
  getPosts: async () => listCatalog<Post>("post").filter(live),
  getPost: async (slug) => onlyLive(getCatalog<Post>("post", slug)),
  getCruises: async () => listCatalog<Cruise>("cruise").filter(live),
  getCruise: async (slug) => onlyLive(getCatalog<Cruise>("cruise", slug)),
  getVisas: async () => listCatalog<Visa>("visa").filter(live),
  getVisa: async (slug) => onlyLive(getCatalog<Visa>("visa", slug)),
  getPage: async (slug) => onlyLive(getCatalog<InfoPage>("page", slug)),
  getSettings: async () => ({ ...defaultSettings, ...(getCatalog<SiteSettings>("settings", "site") ?? {}) }),
};

export const productService: ProductService = mytourbee;
