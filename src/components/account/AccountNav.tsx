"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["Profile", "/account"], ["My Trips", "/account/trips"], ["Wishlist", "/wishlist"],
  ["Payments", "/account/payments"], ["Reviews", "/account/reviews"], ["Documents", "/account/documents"],
];

export default function AccountNav() {
  const path = usePathname();
  return (
    <nav aria-label="Account" className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
      {tabs.map(([label, href]) => {
        const on = href === "/account" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium ${on ? "border-primary bg-primary text-white" : "border-line text-heading hover:border-primary"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
