import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import { productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Contact & Support | MyTourbee",
  description: "Talk to a MyTourbee travel expert by phone, WhatsApp or email, or send us an enquiry.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const site = await productService.getSettings();
  const wa = site.whatsapp.replace(/\D/g, "");
  const tel = site.phone.replace(/[^\d+]/g, "");
  const hasPhone = /\d{8,}/.test(tel);

  const cards = [
    hasPhone && ["📞", "Phone", site.phone, `tel:${tel}`],
    wa.length >= 8 && ["💬", "WhatsApp", "Chat with us", `https://wa.me/${wa}`],
    ["📧", "Email", site.email, `mailto:${site.email}`],
  ].filter(Boolean) as string[][];

  return (
    <>
      <section className="bg-primary-dark">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link> &gt; Contact</nav>
          <h1 className="mt-3 text-3xl !text-white md:text-5xl">Talk to a Travel Expert</h1>
          <p className="mt-2 max-w-xl text-white/85 md:text-lg">Real people, from planning to return. {site.hours}.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[320px_1fr]">
        <ul className="space-y-4">
          {cards.map(([icon, title, text, href]) => (
            <li key={title}>
              <a href={href} className="flex items-center gap-4 rounded-2xl border border-line p-5 hover:shadow-md">
                <span className="text-3xl">{icon}</span>
                <span><span className="block font-semibold text-heading">{title}</span><span className="text-sm">{text}</span></span>
              </a>
            </li>
          ))}
          {site.address && <li className="rounded-2xl border border-line p-5"><p className="font-semibold text-heading">📍 Office</p><p className="mt-1 whitespace-pre-line text-sm">{site.address}</p></li>}
          <li className="rounded-2xl bg-surface p-5 text-sm">Planning a whole trip? <Link href="/custom-trip" className="font-semibold text-primary">Create My Trip</Link> and we will send a quote.</li>
        </ul>
        <section aria-labelledby="send">
          <h2 id="send" className="mb-4 text-2xl">Send an enquiry</h2>
          <ContactForm />
        </section>
      </div>
    </>
  );
}
