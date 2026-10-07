import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login or Register | MyTourbee",
  description: "Sign in to MyTourbee to manage your trips, wishlist and bookings.",
  robots: { index: false },
};

/** Only allow same-site relative paths, so ?next= can't be used as an open redirect. */
function safeNext(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  return s && /^\/(?![/\\])/.test(s) ? s : "/account";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNext((await searchParams).next);
  return (
    <div className="bg-surface">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="hidden md:block">
          <h2 className="text-4xl">Your trips, all in one place.</h2>
          <ul className="mt-6 space-y-3">
            {["Save favourite trips to your wishlist", "Track enquiries and bookings", "Get vouchers and documents instantly"].map((t) => (
              <li key={t} className="flex gap-3"><span className="text-success">✓</span>{t}</li>
            ))}
          </ul>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
