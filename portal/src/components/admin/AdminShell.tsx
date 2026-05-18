"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/publications/new", label: "Upload" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/logs/otp", label: "OTP audit" },
  { href: "/admin/logs/access", label: "Access log" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-52 shrink-0">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Admin CMS
        </p>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-3 py-2 text-sm ${
                pathname === l.href
                  ? "bg-[var(--icai-navy)] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-6 text-left text-sm text-red-700 hover:underline"
        >
          Sign out
        </button>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
