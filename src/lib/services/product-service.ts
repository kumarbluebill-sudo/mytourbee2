import type { DestinationDetail } from "@/data/destinations";
import type { ActivityFull, Cruise, Deal, Destination, Post, Review, InfoPage, SiteSettings, Tour, Visa } from "@/data/types";

/**
 * Single seam between the UI and product sources. Today it is backed by
 * MyTourbee-managed data; Viator and other suppliers can be added behind
 * this interface without touching components.
 */
export interface ProductService {
  getTrendingDestinations(): Promise<Destination[]>;
  getDomesticDestinations(): Promise<Destination[]>;
  getInternationalDestinations(): Promise<Destination[]>;
  getAllDestinations(): Promise<DestinationDetail[]>;
  getDestination(slug: string): Promise<DestinationDetail | undefined>;
  getDeals(): Promise<Deal[]>;
  getTours(): Promise<Tour[]>;
  getTour(slug: string): Promise<Tour | undefined>;
  getActivities(): Promise<ActivityFull[]>;
  getActivity(slug: string): Promise<ActivityFull | undefined>;
  /** Approved customer reviews; pass a slug to get those for one tour or activity. */
  getReviews(slug?: string): Promise<Review[]>;
  getPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | undefined>;
  getCruises(): Promise<Cruise[]>;
  getCruise(slug: string): Promise<Cruise | undefined>;
  getVisas(): Promise<Visa[]>;
  getVisa(slug: string): Promise<Visa | undefined>;
  getPage(slug: string): Promise<InfoPage | undefined>;
  getSettings(): Promise<SiteSettings>;
}
