import type { ReactNode } from "react";
import Button from "./Button";

export default function Section({
  title, subtitle, cta, tone = "white", children,
}: {
  title: string; subtitle?: string; cta?: { label: string; href: string };
  tone?: "white" | "surface"; children: ReactNode;
}) {
  return (
    <section className={tone === "surface" ? "bg-surface" : "bg-white"}>
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl">{subtitle}</p>}
        <div className="mt-6 md:mt-8">{children}</div>
        {cta && (
          <div className="mt-8">
            <Button href={cta.href} variant="secondary">{cta.label}</Button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Horizontal scroll-snap on mobile (~1.5 cards visible), grid on desktop. */
export function CardRail({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 }) {
  return (
    <div
      className={`scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:overflow-visible md:px-0 ${
        cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3"
      } [&>*]:w-[68%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[42%] md:[&>*]:w-auto`}
    >
      {children}
    </div>
  );
}
