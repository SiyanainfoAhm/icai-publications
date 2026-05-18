"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/flipbook")) {
    return null;
  }

  return (
    <header className="icai-header text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--icai-gold)] bg-white/10 text-lg font-bold text-[var(--icai-gold)]">
            ICAI
          </span>
          <span className="block">
            <span className="block text-xs uppercase tracking-widest text-[var(--icai-gold-soft)]">
              Institute of Chartered Accountants of India
            </span>
            <span className="block text-lg font-semibold leading-tight">
              Publications Portal
            </span>
          </span>
        </Link>
        <SiteHeaderNav />
      </div>
    </header>
  );
}
