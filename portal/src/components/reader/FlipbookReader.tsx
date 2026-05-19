"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getFlipbookPages,
  searchFlipbookPages,
  type FlipbookPage,
} from "@/lib/flipbook-content";

type ZoomMode = "custom" | "fit-width" | "fit-page";

function highlightText(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  while (cursor < text.length) {
    let matchAt = -1;
    let matchLen = 0;
    for (const t of terms) {
      const i = lower.indexOf(t, cursor);
      if (i >= 0 && (matchAt === -1 || i < matchAt)) {
        matchAt = i;
        matchLen = t.length;
      }
    }
    if (matchAt === -1) {
      parts.push(text.slice(cursor));
      break;
    }
    if (matchAt > cursor) parts.push(text.slice(cursor, matchAt));
    parts.push(
      <mark key={key++} className="flipbook-highlight">
        {text.slice(matchAt, matchAt + matchLen)}
      </mark>,
    );
    cursor = matchAt + matchLen;
  }

  return parts;
}

type FlipbookReaderProps = {
  title: string;
  slug: string;
  backHref: string;
  initialPage?: number;
  highlightQuery?: string;
  pages?: FlipbookPage[];
  coverUrl?: string | null;
};

export function FlipbookReader({
  title,
  slug,
  backHref,
  initialPage = 0,
  highlightQuery = "",
  pages: pagesProp,
  coverUrl,
}: FlipbookReaderProps) {
  const router = useRouter();
  const pages = useMemo(
    () => pagesProp ?? getFlipbookPages(slug) ?? [],
    [pagesProp, slug],
  );
  const pageCount = pages.length;

  const [page, setPage] = useState(initialPage);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit-width");
  const [zoom, setZoom] = useState(100);
  const [pageJump, setPageJump] = useState(String(initialPage + 1));
  const [tocQuery, setTocQuery] = useState("");
  const [issueSearch, setIssueSearch] = useState(highlightQuery);
  const [searchHits, setSearchHits] = useState<
    { page: number; label: string; snippet: string }[]
  >([]);
  const [flip, setFlip] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(pageCount - 1, initialPage));
    setPage(clamped);
    setPageJump(String(clamped + 1));
    if (highlightQuery) {
      setIssueSearch(highlightQuery);
      setSearchHits(searchFlipbookPages(slug, highlightQuery));
    }
  }, [initialPage, highlightQuery, pageCount, slug]);

  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, []);

  const filteredToc = useMemo(() => {
    if (!tocQuery.trim()) return pages;
    const n = tocQuery.toLowerCase();
    return pages.filter((t) => t.label.toLowerCase().includes(n));
  }, [pages, tocQuery]);

  const go = useCallback(
    (next: number) => {
      if (pageCount === 0) return;
      const clamped = Math.max(0, Math.min(pageCount - 1, next));
      if (clamped === page) return;
      setFlip(true);
      window.setTimeout(() => {
        setPage(clamped);
        setPageJump(String(clamped + 1));
        setFlip(false);
      }, 180);
    },
    [page, pageCount],
  );

  const runIssueSearch = () => {
    const hits = searchFlipbookPages(slug, issueSearch);
    setSearchHits(hits);
    if (hits.length === 0) {
      setMessage(`No match for "${issueSearch}". Try GST, Audit, or Ind AS.`);
      return;
    }
    go(hits[0].page);
    setMessage(`Found ${hits.length} match(es). Showing page ${hits[0].page + 1}.`);
  };

  const jumpToPage = () => {
    const n = parseInt(pageJump, 10);
    if (Number.isNaN(n) || n < 1 || n > pageCount) {
      setMessage(`Enter a page between 1 and ${pageCount}.`);
      return;
    }
    go(n - 1);
    setMessage(null);
  };

  const coverSrc =
    coverUrl?.trim() ||
    (slug === "ca-journal-may-2026" ? "/covers/ca-journal.png" : "/covers/default.svg");

  const current: FlipbookPage | undefined = pages[page];
  const zoomStyle =
    zoomMode === "fit-width"
      ? { transform: "scale(1)", width: "100%" as const }
      : zoomMode === "fit-page"
        ? { transform: "scale(1)", maxHeight: "min(70vh, 640px)" as const }
        : { transform: `scale(${zoom / 100})`, transformOrigin: "top center" as const };

  if (pageCount === 0) {
    return (
      <p className="p-8 text-white">This publication does not have flipbook content yet.</p>
    );
  }

  return (
    <div
      className="flipbook-reader min-h-dvh bg-[var(--icai-navy)] text-white"
      onContextMenu={(e) => e.preventDefault()}
    >
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
                eBook reader — session access
              </p>
              <p className="text-lg font-semibold">{title}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Print &amp; download disabled</p>
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
            <nav className="mt-3 max-h-48 space-y-1 overflow-y-auto lg:max-h-80" aria-label="Table of contents">
              {filteredToc.map((t) => (
                <button
                  key={t.page}
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

            {searchHits.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Search hits</p>
                <ul className="mt-2 space-y-2">
                  {searchHits.map((h) => (
                    <li key={h.page}>
                      <button
                        type="button"
                        className="w-full rounded-lg bg-white/5 px-2 py-2 text-left text-xs hover:bg-white/10"
                        onClick={() => go(h.page)}
                      >
                        <span className="font-semibold text-[var(--icai-gold-soft)]">
                          p.{h.page + 1} — {h.label}
                        </span>
                        <span className="mt-1 block text-slate-400">{h.snippet}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  className="rounded-lg bg-white/10 px-3 py-2 disabled:opacity-40"
                  onClick={() => go(page - 1)}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount - 1}
                  className="rounded-lg bg-white/10 px-3 py-2 disabled:opacity-40"
                  onClick={() => go(page + 1)}
                  aria-label="Next page"
                >
                  Next →
                </button>
                <label className="flex items-center gap-1 text-sm">
                  <span className="text-slate-400">Page</span>
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={pageJump}
                    onChange={(e) => setPageJump(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
                    className="w-14 rounded border border-white/20 bg-[var(--icai-navy)] px-2 py-1 text-center"
                  />
                  <span className="text-slate-400">/ {pageCount}</span>
                  <button
                    type="button"
                    onClick={jumpToPage}
                    className="rounded bg-white/10 px-2 py-1 text-xs"
                  >
                    Go
                  </button>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <select
                  value={zoomMode}
                  onChange={(e) => setZoomMode(e.target.value as ZoomMode)}
                  className="rounded-lg border border-white/20 bg-[var(--icai-navy)] px-2 py-1"
                  aria-label="Zoom mode"
                >
                  <option value="fit-width">Fit width</option>
                  <option value="fit-page">Fit page</option>
                  <option value="custom">Custom %</option>
                </select>
                {zoomMode === "custom" && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={issueSearch}
                onChange={(e) => setIssueSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runIssueSearch()}
                placeholder="Search inside publication…"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[var(--icai-navy)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--icai-gold)]"
              />
              <button
                type="button"
                onClick={runIssueSearch}
                className="shrink-0 rounded-lg bg-[var(--icai-gold)] px-4 py-2 text-sm font-semibold text-[var(--icai-navy)]"
              >
                Search
              </button>
            </div>

            <div
              className={`flipbook-page-viewport relative mt-4 overflow-auto rounded-lg border border-white/10 bg-gradient-to-br from-[var(--icai-navy-light)] to-[var(--icai-navy)] shadow-2xl ${
                zoomMode === "fit-page" ? "flex items-center justify-center" : ""
              }`}
              style={{ minHeight: "min(70vh, 640px)" }}
            >
              <div
                className={`transition-all duration-200 ${flip ? "translate-x-2 opacity-40 scale-[0.98]" : ""} ${
                  zoomMode === "fit-width" ? "w-full" : "mx-auto"
                }`}
                style={zoomStyle}
              >
                {page === 0 ? (
                  <div className="flex min-h-[min(70vh,640px)] items-center justify-center p-4 sm:p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverSrc}
                      alt={title}
                      className="max-h-[min(65vh,600px)] w-auto max-w-full rounded-lg object-contain shadow-lg select-none"
                      draggable={false}
                    />
                  </div>
                ) : current ? (
                  <div className="p-6 sm:p-10 md:p-12">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--icai-gold-soft)]">
                      {current.label}
                    </p>
                    <h2 className="mt-3 text-xl font-bold sm:text-2xl md:text-3xl">
                      {highlightText(current.headline, issueSearch)}
                    </h2>
                    <p className="mt-6 leading-relaxed text-slate-300">
                      {highlightText(current.body, issueSearch)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
