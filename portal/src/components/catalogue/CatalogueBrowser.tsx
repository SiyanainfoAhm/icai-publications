"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicationCard } from "@/components/PublicationCard";
import { Breadcrumbs } from "@/components/catalogue/Breadcrumbs";
import { distinctValues } from "@/lib/catalogue-search";
import { PUBLICATION_TYPE_LABELS } from "@/lib/publication-sow";
import type { PublicationMeta, PublicationType } from "@/lib/types";

const FILTER_STORAGE_KEY = "icai_catalogue_filters";

type StoredFilters = {
  committee: string;
  topic: string;
  type: string;
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: StoredFilters = {
  committee: "",
  topic: "",
  type: "",
  dateFrom: "",
  dateTo: "",
};

function loadFilters(): StoredFilters {
  if (typeof window === "undefined") return emptyFilters;
  try {
    const raw = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return emptyFilters;
    return { ...emptyFilters, ...JSON.parse(raw) };
  } catch {
    return emptyFilters;
  }
}

function saveFilters(f: StoredFilters) {
  sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(f));
}

export function CatalogueBrowser({
  publications,
  configured,
}: {
  publications: PublicationMeta[];
  configured: boolean;
}) {
  const [filters, setFilters] = useState<StoredFilters>(emptyFilters);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFilters(loadFilters());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: StoredFilters) => {
    setFilters(next);
    saveFilters(next);
  }, []);

  const { committees, topics } = useMemo(
    () => distinctValues(publications),
    [publications],
  );

  const filtered = useMemo(() => {
    return publications.filter((p) => {
      if (filters.committee && p.committee !== filters.committee) return false;
      if (filters.topic && p.topic !== filters.topic) return false;
      if (filters.type && p.publication_type !== filters.type) return false;
      if (filters.dateFrom && p.release_date && p.release_date < filters.dateFrom) return false;
      if (filters.dateTo && p.release_date && p.release_date > filters.dateTo) return false;
      return true;
    });
  }, [publications, filters]);

  const featured = useMemo(
    () => filtered.filter((p) => p.is_featured),
    [filtered],
  );

  const latest = useMemo(() => {
    const featuredIds = new Set(featured.map((p) => p.id));
    return [...filtered]
      .filter((p) => !featuredIds.has(p.id))
      .sort((a, b) => (b.release_date ?? "").localeCompare(a.release_date ?? ""))
      .slice(0, 6);
  }, [filtered, featured]);

  const hasActiveFilters =
    filters.committee || filters.topic || filters.type || filters.dateFrom || filters.dateTo;

  const searchHref = (() => {
    const params = new URLSearchParams();
    if (filters.committee) params.set("committee", filters.committee);
    if (filters.topic) params.set("topic", filters.topic);
    if (filters.type) params.set("type", filters.type);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  })();

  if (!hydrated) {
    return <p className="text-slate-500">Loading catalogue…</p>;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Publications catalogue" }]} />

      <section className="mb-10 rounded-lg border border-[var(--icai-gold)] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[var(--icai-navy)]">ICAI Publications Catalogue</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Browse by committee, topic, and release date. Open the interactive eBook reader for
          flipbook titles after sign-in. Use advanced search for metadata and indexed content.
        </p>
        <Link
          href={searchHref}
          className="icai-btn-primary mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Advanced search
        </Link>
      </section>

      {!configured && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The catalogue is not yet connected to the publication service.
        </p>
      )}

      <aside className="catalogue-filters mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--icai-navy)]">
            Filter publications
          </h2>
          {hasActiveFilters && (
            <button
              type="button"
              className="text-sm font-semibold text-[var(--icai-navy)] hover:underline"
              onClick={() => persist(emptyFilters)}
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Committee</span>
            <select
              value={filters.committee}
              onChange={(e) => persist({ ...filters, committee: e.target.value })}
              className="icai-field-input w-full"
            >
              <option value="">All committees</option>
              {committees.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Topic</span>
            <select
              value={filters.topic}
              onChange={(e) => persist({ ...filters, topic: e.target.value })}
              className="icai-field-input w-full"
            >
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Publication type</span>
            <select
              value={filters.type}
              onChange={(e) => persist({ ...filters, type: e.target.value })}
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
            <span className="mb-1 block font-medium text-slate-700">Release from</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => persist({ ...filters, dateFrom: e.target.value })}
              className="icai-field-input w-full"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Release to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => persist({ ...filters, dateTo: e.target.value })}
              className="icai-field-input w-full"
            />
          </label>
        </div>
      </aside>

      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[var(--icai-navy)]">Featured publications</h2>
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PublicationCard key={p.id} publication={p} />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[var(--icai-navy)]">Latest releases</h2>
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <PublicationCard key={`latest-${p.id}`} publication={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-[var(--icai-navy)]">
          All publications
          <span className="ml-2 text-base font-normal text-slate-500">({filtered.length})</span>
        </h2>
        {filtered.length === 0 ? (
          <p className="text-slate-600">No publications match your filters.</p>
        ) : (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PublicationCard key={p.id} publication={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
