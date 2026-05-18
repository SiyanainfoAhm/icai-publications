"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { canAccessFlipbook } from "@/lib/auth/access";
import { hasFlipbook } from "@/lib/flipbook";
import type { SessionUser } from "@/lib/types";

export function CatalogueCardActions({ slug }: { slug: string }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null));
  }, []);

  if (!hasFlipbook(slug) || !canAccessFlipbook(user)) {
    return null;
  }

  return (
    <Link
      href={`/flipbook/${slug}`}
      className="mt-2 inline-block text-sm font-semibold text-[var(--icai-gold)] hover:underline"
    >
      Open flipbook →
    </Link>
  );
}
