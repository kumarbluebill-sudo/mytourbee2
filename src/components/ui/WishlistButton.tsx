"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistButton({ itemKey, label, className = "" }: { itemKey: string; label: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const saved = has(itemKey);
  return (
    <button
      type="button" onClick={() => toggle(itemKey)} aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from wishlist` : `Save ${label} to wishlist`}
      className={`flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm ${className}`}
    >
      <Heart size={18} className={saved ? "fill-discount text-discount" : "text-heading"} />
    </button>
  );
}
