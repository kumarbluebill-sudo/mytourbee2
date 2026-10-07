import { redirect } from "next/navigation";
import AccountNav from "@/components/account/AccountNav";
import { getSession, isAdmin, maskIdent } from "@/lib/auth";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const s = await getSession();
  if (!s) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl">My Account</h1>
          <p className="mt-1 text-sm">Signed in as <span className="font-semibold text-heading">{maskIdent(s.ident)}</span></p>
        </div>
        {isAdmin(s) && <a href="/admin" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-heading">Open admin</a>}
      </div>
      <AccountNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
