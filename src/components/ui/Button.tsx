import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-white text-primary border border-primary hover:bg-surface",
  accent: "bg-accent text-heading hover:brightness-95",
  text: "text-primary hover:underline px-0",
} as const;

export default function Button({
  href, variant = "primary", children, className = "",
}: { href: string; variant?: keyof typeof variants; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-1 rounded-full px-6 text-sm font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
