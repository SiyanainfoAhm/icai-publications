"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { canAccessReader } from "@/lib/auth/access";
import type { PublicationMeta, SessionUser } from "@/lib/types";

export function CatalogueCardActions({ publication }: { publication: PublicationMeta }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .finally(() => setReady(true));
  }, []);

  const detailHref = `/publications/${publication.slug}`;
  const loginHref = `/login?redirect=${encodeURIComponent(detailHref)}`;

  if (!ready) {
    return (
      <p className="mt-4 text-sm text-slate-400" aria-hidden>
        Checking access…
      </p>
    );
  }

  if (canAccessReader(user)) {
    return (
      <Link
        href={detailHref}
        className="icai-btn-primary mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-95"
      >
        View publication
      </Link>
    );
  }

  return (
    <Link
      href={loginHref}
      className="mt-4 inline-block rounded-lg border-2 border-[var(--icai-navy)] bg-white px-4 py-2 text-sm font-semibold text-[var(--icai-navy)] transition hover:bg-[var(--icai-cream)]"
    >
      Login to read
    </Link>
  );
}
