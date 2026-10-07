import Link from "next/link";
import { Heart, Home, Search, Ticket, User } from "lucide-react";

const items = [
  [Home, "Home", "/"], [Search, "Explore", "/search"], [Heart, "Wishlist", "/wishlist"],
  [Ticket, "Trips", "/account/trips"], [User, "Account", "/account"],
] as const;

export default function BottomNav() {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(([Icon, label, href]) => (
          <li key={label}>
            <Link href={href} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs">
              <Icon size={20} />{label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
