import type { Metadata } from "next";
import Link from "next/link";
import WishlistView from "@/components/wishlist/WishlistView";
import { productService } from "@/lib/services";

export const metadata: Metadata = { title: "My Wishlist | MyTourbee", robots: { index: false } };

export default async function WishlistPage() {
  const [tours, activities, cruises] = await Promise.all([productService.getTours(), productService.getActivities(), productService.getCruises()]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm"><Link href="/" className="hover:text-primary">Home</Link> &gt; Wishlist</nav>
      <h1 className="mt-3 text-3xl md:text-4xl">♡ My Wishlist</h1>
      <p className="mb-8 mt-1">Saved on this device.</p>
      <WishlistView tours={tours} activities={activities} cruises={cruises} />
    </div>
  );
}
