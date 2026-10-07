import Link from "next/link";
import { productService } from "@/lib/services";

const cols: [string, [string, string][]][] = [
  ["Company", [["About", "/about"], ["Contact", "/contact"], ["Careers", "/careers"]]],
  ["Travel", [["Domestic Tours", "/tours/domestic"], ["International Tours", "/tours/international"], ["Things To Do", "/things-to-do"], ["Cruises", "/cruises"], ["Deals", "/deals"]]],
  ["Support", [["FAQs", "/faq"], ["Cancellation", "/cancellation"], ["Terms", "/terms"], ["Privacy", "/privacy"]]],
];

export default async function Footer() {
  const site = await productService.getSettings();
  const social = [["Instagram", site.instagram], ["Facebook", site.facebook], ["YouTube", site.youtube]].filter(([, u]) => u);
  return (
    <footer className="bg-heading text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-6">
        <div className="md:col-span-2">
          <p className="text-xl font-extrabold text-white">MYTOURBEE</p>
          <p className="mt-2">Your Trip. Your Way.</p>
          <p className="mt-4">📞 {site.phone}</p>
          <p>📧 {site.email}</p>
        </div>
        {social.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase !text-white">Follow</h3>
            <ul className="space-y-2">
              {social.map(([l, u]) => <li key={l}><a href={u} rel="noopener noreferrer" target="_blank" className="inline-block py-1 hover:text-white">{l}</a></li>)}
            </ul>
          </div>
        )}
        {cols.map(([title, links]) => (
          <div key={title}>
            <h3 className="mb-3 text-sm font-semibold uppercase !text-white">{title}</h3>
            <ul className="space-y-2">
              {links.map(([l, h]) => (
                <li key={l}><Link href={h} className="inline-block py-1 hover:text-white">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-white/10 py-4 text-center text-sm">© {new Date().getFullYear()} MyTourbee</p>
    </footer>
  );
}
