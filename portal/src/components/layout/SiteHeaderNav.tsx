"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";

export function SiteHeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const loadSession = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession, pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return <nav className="h-9 w-48 animate-pulse rounded bg-white/10" aria-hidden />;
  }

  return (
    <nav className="flex flex-wrap items-center gap-3 text-sm">
      <Link href="/" className="hover:text-[var(--icai-gold)]">
        Catalogue
      </Link>

      {user ? (
        <>
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="rounded border border-[var(--icai-gold)] px-3 py-1.5 text-[var(--icai-gold)] hover:bg-white/10"
            >
              Admin CMS
            </Link>
          )}
          <button
            type="button"
            onClick={signOut}
            className="rounded bg-white/10 px-3 py-1.5 font-medium hover:bg-white/15"
          >
            Sign out
          </button>
        </>
      ) : (
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname ?? "/")}`}
          className="hover:text-[var(--icai-gold)]"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
