"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { formatPublicationType } from "@/lib/format";
import { PUBLICATION_TYPE_LABELS } from "@/lib/publication-sow";
import { publicationSupportsFlipbook } from "@/lib/flipbook";
import type { PublicationType } from "@/lib/types";

type SearchResult = {
  slug: string;
  title: string;
  committee: string | null;
  topic: string | null;
  publication_type: PublicationType;
  release_date: string | null;
  snippet: string;
  matchedFields: string[];
};

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [committee, setCommittee] = useState(searchParams.get("committee") ?? "");
  const [topic, setTopic] = useState(searchParams.get("topic") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (committee) params.set("committee", committee);
    if (topic) params.set("topic", topic);
    if (type) params.set("type", type);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    router.replace(params.toString() ? `/search?${params}` : "/search", { scroll: false });

    const res = await fetch(`/api/publications/search?${params}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setSearched(true);
    setLoading(false);
  }, [q, committee, topic, type, dateFrom, dateTo, router]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (q.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      fetch(`/api/publications/suggest?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((d) => setSuggestions(d.suggestions ?? []));
    }, 200);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (searchParams.get("q") || searchParams.get("committee") || searchParams.get("topic")) {
      runSearch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial URL only

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Search" },
        ]}
      />

      <h1 className="text-3xl font-bold text-[var(--icai-navy)]">Advanced search</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Search publication metadata (title, committee, topic, keywords, dates) and synopsis
        text. Full PDF indexing is planned for production; flipbook issues support in-reader
        search with highlighted matches.
      </p>

      <form
        className="catalogue-filters mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            list="search-suggestions"
            placeholder="Title, keywords, committee…"
            className="icai-field-input w-full"
            autoFocus
          />
          <datalist id="search-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Committee</span>
            <input
              value={committee}
              onChange={(e) => setCommittee(e.target.value)}
              placeholder="Filter committee"
              className="icai-field-input w-full"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Filter topic"
              className="icai-field-input w-full"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="icai-field-input w-full"
            >
              <option value="">All types</option>
              {(Object.keys(PUBLICATION_TYPE_LABELS) as PublicationType[]).map((k) => (
                <option key={k} value={k}>
                  {PUBLICATION_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Release from</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="icai-field-input w-full"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Release to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="icai-field-input w-full"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="icai-btn-primary rounded-lg px-6 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {searched && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--icai-navy)]">
            {results.length} result{results.length === 1 ? "" : "s"}
          </h2>
          {results.length === 0 ? (
            <p className="mt-4 text-slate-600">No publications matched your query.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {results.map((r) => (
                <li
                  key={r.slug}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[var(--icai-navy)]">
                      <Link href={`/publications/${r.slug}`} className="hover:underline">
                        {r.title}
                      </Link>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {formatPublicationType(r.publication_type)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {[r.committee, r.topic, r.release_date].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{r.snippet}</p>
                  {r.matchedFields.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Matched: {r.matchedFields.join(", ")}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/publications/${r.slug}`}
                      className="rounded border border-[var(--icai-navy)] px-3 py-1 text-sm font-semibold text-[var(--icai-navy)]"
                    >
                      View details
                    </Link>
                    {publicationSupportsFlipbook(r) && q.trim() && (
                      <Link
                        href={`/flipbook/${r.slug}?q=${encodeURIComponent(q.trim())}`}
                        className="rounded bg-[var(--icai-gold)] px-3 py-1 text-sm font-semibold text-[var(--icai-navy)]"
                      >
                        Open in eBook reader
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-10 text-slate-500">Loading search…</p>}>
      <SearchPageInner />
    </Suspense>
  );
}
