"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/flipbook")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-brand">Institute of Chartered Accountants of India</span>
        <span className="site-footer-sep" aria-hidden>
          ·
        </span>
        <span>Publications Portal</span>
        <span className="site-footer-badge">Demo</span>
      </div>
    </footer>
  );
}
