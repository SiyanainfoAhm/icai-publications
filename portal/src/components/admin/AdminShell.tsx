"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/publications/new", label: "Upload" },
  { href: "/admin/publications/bulk", label: "Bulk upload" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/logs/otp", label: "OTP audit" },
  { href: "/admin/logs/access", label: "Access log" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const wideContent =
    pathname === "/admin/publications" ||
    pathname === "/admin/publications/bulk" ||
    pathname.startsWith("/admin/publications/") ||
    pathname === "/admin/users";

  /** Exact path match only — avoids /publications matching /publications/bulk. */
  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <ToastProvider>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="admin-sidebar-brand">ICAI Admin CMS</p>
          <nav className="admin-nav">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`admin-nav-link ${isActive(l.href) ? "admin-nav-link--active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="admin-main">
          <div
            className={`admin-page-content${wideContent ? " admin-page-content--wide" : ""}`}
          >
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
