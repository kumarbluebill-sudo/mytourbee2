"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileMenu({ links }: { links: string[][] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)} className="flex size-11 items-center justify-center">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Menu" className="absolute inset-x-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-white px-4 py-3 shadow-lg">
          <ul>
            {links.map(([label, href]) => (
              <li key={href}><Link href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line text-base font-medium text-heading">{label}</Link></li>
            ))}
            <li><Link href="/contact" onClick={() => setOpen(false)} className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-accent font-semibold text-heading">Talk to Expert</Link></li>
          </ul>
        </nav>
      )}
    </div>
  );
}
