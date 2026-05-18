"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SecureReaderProps {
  slug: string;
  title: string;
}

export function SecureReader({ slug, title }: SecureReaderProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const blockShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", blockShortcuts);
    return () => document.removeEventListener("keydown", blockShortcuts);
  }, []);

  useEffect(() => {
    fetch(`/api/publications/${slug}/content`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Unable to load publication");
        }
        return res.json();
      })
      .then((data) => {
        setHtml(data.publication.content_html);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="text-slate-600">Loading secure reader…</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p>{error}</p>
        <Link href="/login" className="mt-4 inline-block font-semibold text-[var(--icai-navy)]">
          Sign in to continue →
        </Link>
      </div>
    );
  }

  return (
    <div className="secure-reader no-print">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span>
          <strong className="text-[var(--icai-navy)]">Secure view</strong> — {title}
        </span>
        <span className="text-xs">
          Print &amp; download disabled for demo · Screen viewing only
        </span>
      </div>
      {/* Intentionally no print/download controls */}
      <article
        className="icai-reader-content rounded-lg border border-slate-200 bg-white p-8"
        dangerouslySetInnerHTML={{ __html: html ?? "" }}
      />
    </div>
  );
}
