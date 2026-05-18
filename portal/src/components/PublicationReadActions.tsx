"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { canAccessFlipbook } from "@/lib/auth/access";
import { hasFlipbook } from "@/lib/flipbook";
import type { SessionUser } from "@/lib/types";

export function PublicationReadActions({ slug }: { slug: string }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const flipbook = hasFlipbook(slug);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <aside className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-500">Loading access options…</p>
      </aside>
    );
  }

  const allowed = canAccessFlipbook(user);

  if (!allowed) {
    return (
      <aside className="mt-8 rounded-lg border border-[var(--icai-gold)] bg-[var(--icai-navy)] p-6 text-white">
        <h2 className="font-semibold">Read this publication</h2>
        <p className="mt-2 text-sm text-slate-200">
          Sign in with email OTP, ICAI member credentials, or administrator access to
          open the flipbook and full text.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/publications/${slug}`)}`}
          className="mt-4 inline-block rounded bg-[var(--icai-gold)] px-5 py-2 text-sm font-semibold text-[var(--icai-navy)] hover:opacity-90"
        >
          Sign in to read
        </Link>
      </aside>
    );
  }

  return (
    <aside className="mt-8 rounded-lg border border-[var(--icai-gold)] bg-[var(--icai-navy)] p-6 text-white">
      <h2 className="font-semibold">Read this publication</h2>
      <p className="mt-2 text-sm text-slate-200">
        Choose the interactive flipbook (page-turn demo) or the secure article view.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {flipbook && (
          <Link
            href={`/flipbook/${slug}`}
            className="inline-block rounded bg-[var(--icai-gold)] px-5 py-2 text-sm font-semibold text-[var(--icai-navy)] hover:opacity-90"
          >
            Open flipbook
          </Link>
        )}
        <Link
          href={`/reader/${slug}`}
          className={`inline-block rounded px-5 py-2 text-sm font-semibold ${
            flipbook
              ? "border border-[var(--icai-gold)] text-[var(--icai-gold)] hover:bg-white/10"
              : "bg-[var(--icai-gold)] text-[var(--icai-navy)] hover:opacity-90"
          }`}
        >
          Secure article view
        </Link>
      </div>
    </aside>
  );
}
