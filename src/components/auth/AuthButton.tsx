"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

type Me = { label: string } | null | undefined;

/** Header login link that turns into an account link once a session exists. */
export default function AuthButton() {
  const [me, setMe] = useState<Me>(undefined);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => live && setMe(j.user))
      .catch(() => live && setMe(null));
    return () => { live = false; };
  }, []);

  const href = me ? "/account" : "/login";
  const text = me ? "Account" : "Login";
  return (
    <Link aria-label={text} href={href} className="flex size-11 items-center justify-center md:w-auto md:px-3 md:font-medium">
      <User size={20} className="md:hidden" /><span className="hidden md:inline">{text}</span>
    </Link>
  );
}
