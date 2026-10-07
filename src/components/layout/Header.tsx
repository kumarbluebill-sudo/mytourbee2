import Image from "next/image";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";
import MobileMenu from "@/components/layout/MobileMenu";
import Button from "@/components/ui/Button";

const nav = [
  ["Destinations", "/destinations"], ["Tours", "/tours"],
  ["Things To Do", "/things-to-do"], ["Cruises", "/cruises"], ["Visa", "/visa"], ["Deals", "/deals"],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MobileMenu links={nav} />
          <Link href="/" aria-label="MyTourbee home">
            <Image src="/logo.png" alt="MyTourbee — Luxury Travel Experiences" width={1774} height={887} priority className="h-14 w-auto" />
          </Link>
        </div>
        <nav aria-label="Main" className="hidden gap-5 text-sm lg:flex xl:gap-8 xl:text-base">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="font-medium text-heading hover:text-primary">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link aria-label="Search" href="/search" className="flex size-11 items-center justify-center"><Search size={20} /></Link>
          <Link href="/wishlist" aria-label="Wishlist" className="hidden size-11 items-center justify-center gap-1 md:flex xl:w-auto xl:px-3 xl:font-medium"><Heart size={18} /><span className="hidden xl:inline">Wishlist</span></Link>
          <AuthButton />
          <Button href="/contact" variant="accent" className="ml-2 hidden lg:inline-flex">Talk to Expert</Button>
        </div>
      </div>
    </header>
  );
}
