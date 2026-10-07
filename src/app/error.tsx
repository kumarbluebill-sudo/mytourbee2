"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden>⚠️</p>
      <h1 className="mt-3 text-3xl">Something went wrong</h1>
      <p className="mt-2">We couldn&apos;t load this page. Please try again, or head back home.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">Try again</button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-primary px-6 text-sm font-semibold text-primary">Go home</Link>
      </div>
    </div>
  );
}
