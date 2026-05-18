"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/flipbook")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-600">
      <p className="font-medium text-[var(--icai-navy)]">
        Institute of Chartered Accountants of India
      </p>
      <p className="mt-1">Publications Portal — Demonstration Environment</p>
      <p className="mt-2 text-xs text-slate-500">
        Demonstration environment · Institute of Chartered Accountants of India
      </p>
    </footer>
  );
}
