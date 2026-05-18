"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type TocItem = { label: string; page: number };

const TOC: TocItem[] = [
  { label: "Cover", page: 0 },
  { label: "Editorial", page: 1 },
  { label: "GST — Updates & compliance", page: 2 },
  { label: "Audit — Standards & documentation", page: 3 },
  { label: "Corporate Law", page: 4 },
  { label: "Accounting Standards", page: 5 },
  { label: "Technology", page: 6 },
  { label: "Sustainability", page: 7 },
];

const PAGE_COUNT = 8;

const HEADLINES = [
  "Cover — The Chartered Accountant Journal",
  "Editorial — Profession in a regulated digital economy",
  "GST — Judicial updates, ITC, and compliance toolkit",
  "Audit — SA standards and documentation discipline",
  "Corporate Law — Companies Act and MCA updates",
  "Accounting Standards — Ind AS and disclosures",
  "Technology — AI governance for practice firms",
  "Sustainability — BRSR and assurance readiness",
] as const;

type FlipbookReaderProps = {
  title: string;
  slug: string;
  backHref: string;
};

export function FlipbookReader({ title, slug, backHref }: FlipbookReaderProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [tocQuery, setTocQuery] = useState("");
  const [flip, setFlip] = useState(false);
  const [issueSearch, setIssueSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const filteredToc = useMemo(() => {
    if (!tocQuery.trim()) return TOC;
    const n = tocQuery.toLowerCase();
    return TOC.filter((t) => t.label.toLowerCase().includes(n));
  }, [tocQuery]);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(PAGE_COUNT - 1, next));
    if (clamped === page) return;
    setFlip(true);
    window.setTimeout(() => {
      setPage(clamped);
      setFlip(false);
    }, 180);
  };

  const runIssueSearch = () => {
    const n = issueSearch.trim().toLowerCase();
    if (!n) {
      setMessage("Enter a keyword to search inside this issue.");
      return;
    }
    const idx = HEADLINES.findIndex((h, i) => i > 0 && h.toLowerCase().includes(n));
    if (idx === -1) {
      setMessage(`No match for "${issueSearch}". Try GST, Audit, or Ind AS.`);
      return;
    }
    go(idx);
    setMessage(`Opened page ${idx + 1}.`);
  };

  const coverSrc =
    slug === "ca-journal-may-2026" ? "/covers/ca-journal.png" : "/covers/default.svg";

  return (
    <div className="min-h-dvh bg-[var(--icai-navy)] text-white">
      <div className="border-b border-white/10 bg-[var(--icai-navy-light)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/15"
              onClick={() => router.push(backHref)}
            >
              Close reader
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--icai-gold-soft)]">
                Interactive flipbook
              </p>
              <p className="text-lg font-semibold">{title}</p>
            </div>
          </div>
          <Link
            href={`/reader/${slug}`}
            className="rounded-lg border border-[var(--icai-gold)] px-3 py-2 text-sm font-semibold text-[var(--icai-gold)] hover:bg-white/10"
          >
            Article view
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4">
        {message && (
          <p className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-4 lg:flex-row">
          <aside className="w-full shrink-0 rounded-lg border border-white/10 bg-white/5 p-4 lg:w-64">
            <p className="text-sm font-semibold">Contents</p>
            <input
              value={tocQuery}
              onChange={(e) => setTocQuery(e.target.value)}
              placeholder="Search contents…"
              className="mt-3 w-full rounded-lg border border-white/10 bg-[var(--icai-navy)] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[var(--icai-gold)]"
            />
            <nav className="mt-3 space-y-1" aria-label="Table of contents">
              {filteredToc.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => go(t.page)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    t.page === page
                      ? "bg-[var(--icai-gold)]/20 text-[var(--icai-gold-soft)] ring-1 ring-[var(--icai-gold)]/40"
                      : "text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-xs text-slate-500">{t.page + 1}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  className="rounded-lg bg-white/10 px-3 py-2 disabled:opacity-40"
                  onClick={() => go(page - 1)}
                  aria-label="Previous page"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={page === PAGE_COUNT - 1}
                  className="rounded-lg bg-white/10 px-3 py-2 disabled:opacity-40"
                  onClick={() => go(page + 1)}
                  aria-label="Next page"
                >
                  →
                </button>
                <span className="text-sm font-semibold">
                  Page {page + 1} of {PAGE_COUNT}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  className="rounded-lg bg-white/10 px-2 py-1"
                  onClick={() => setZoom((z) => Math.max(70, z - 10))}
                >
                  −
                </button>
                <span className="min-w-[3rem] text-center">{zoom}%</span>
                <button
                  type="button"
                  className="rounded-lg bg-white/10 px-2 py-1"
                  onClick={() => setZoom((z) => Math.min(140, z + 10))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={issueSearch}
                onChange={(e) => setIssueSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runIssueSearch()}
                placeholder="Search inside issue…"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[var(--icai-navy)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--icai-gold)]"
              />
              <button
                type="button"
                onClick={runIssueSearch}
                className="shrink-0 rounded-lg bg-[var(--icai-gold)] px-4 py-2 text-sm font-semibold text-[var(--icai-navy)]"
              >
                Find
              </button>
            </div>

            <div
              className="relative mt-4 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[var(--icai-navy-light)] to-[var(--icai-navy)] shadow-2xl"
              style={{ minHeight: "min(70vh, 640px)" }}
            >
              <div
                className={`origin-top transition-all duration-200 ${flip ? "translate-x-2 opacity-40 scale-[0.98]" : ""}`}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              >
                {page === 0 ? (
                  <div className="flex min-h-[min(70vh,640px)] items-center justify-center p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverSrc}
                      alt={title}
                      className="max-h-[min(65vh,600px)] w-auto max-w-full rounded-lg shadow-lg object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 md:p-12">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--icai-gold-soft)]">
                      {TOC[page]?.label}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold md:text-3xl">{HEADLINES[page]}</h2>
                    <p className="mt-6 leading-relaxed text-slate-300">
                      Demonstration spread for the May 2026 issue. Production will deliver
                      high-resolution page images with full-text search, member entitlements,
                      and print-safe layouts.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
