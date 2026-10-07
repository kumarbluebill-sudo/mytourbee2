export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const fmtDate = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const tripHref = (kind: string, slug: string) =>
  kind === "tour" ? `/tours/${slug}` : kind === "cruise" ? `/cruises/${slug}` : kind === "visa" ? `/visa/${slug}` : `/things-to-do/${slug}`;

export const kindLabel = (kind: string) => (kind === "tour" ? "package" : kind === "cruise" ? "cruise" : kind === "visa" ? "visa service" : "experience");
