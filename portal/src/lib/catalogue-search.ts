import type { PublicationMeta, PublicationType } from "@/lib/types";

export interface CatalogueSearchFilters {
  q?: string;
  committee?: string;
  topic?: string;
  type?: PublicationType | "";
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchHit {
  publication: PublicationMeta;
  score: number;
  snippet: string;
  matchedFields: string[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

function buildSnippet(text: string, terms: string[]): string {
  const lower = text.toLowerCase();
  let pos = -1;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i >= 0) {
      pos = i;
      break;
    }
  }
  if (pos < 0) return text.slice(0, 160) + (text.length > 160 ? "…" : "");
  const start = Math.max(0, pos - 50);
  const slice = text.slice(start, start + 160);
  return (start > 0 ? "…" : "") + slice + (start + 160 < text.length ? "…" : "");
}

export function searchPublications(
  items: PublicationMeta[],
  filters: CatalogueSearchFilters,
): SearchHit[] {
  const q = (filters.q ?? "").trim().toLowerCase();
  const terms = tokenize(q);

  const hits: SearchHit[] = [];

  for (const pub of items) {
    if (filters.committee && pub.committee !== filters.committee) continue;
    if (filters.topic && pub.topic !== filters.topic) continue;
    if (filters.type && pub.publication_type !== filters.type) continue;
    if (filters.dateFrom && pub.release_date && pub.release_date < filters.dateFrom) continue;
    if (filters.dateTo && pub.release_date && pub.release_date > filters.dateTo) continue;

    const fields: { name: string; text: string; weight: number }[] = [
      { name: "title", text: pub.title, weight: 8 },
      { name: "committee", text: pub.committee ?? "", weight: 4 },
      { name: "topic", text: pub.topic ?? "", weight: 4 },
      { name: "keywords", text: pub.keywords ?? "", weight: 5 },
      { name: "synopsis", text: pub.synopsis ?? "", weight: 3 },
    ];

    let score = 0;
    const matchedFields: string[] = [];
    let snippetSource = pub.synopsis ?? pub.title;

    if (terms.length === 0) {
      hits.push({
        publication: pub,
        score: 1,
        snippet: snippetSource.slice(0, 160),
        matchedFields: [],
      });
      continue;
    }

    for (const f of fields) {
      const lower = f.text.toLowerCase();
      for (const t of terms) {
        if (lower.includes(t)) {
          score += f.weight;
          if (!matchedFields.includes(f.name)) matchedFields.push(f.name);
          if (f.name === "synopsis" || f.name === "title") snippetSource = f.text;
        }
      }
    }

    if (score > 0) {
      hits.push({
        publication: pub,
        score,
        snippet: buildSnippet(snippetSource, terms),
        matchedFields,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score);
}

export function suggestTerms(items: PublicationMeta[], q: string, limit = 8): string[] {
  const n = q.trim().toLowerCase();
  if (n.length < 2) return [];

  const pool = new Set<string>();
  for (const p of items) {
    pool.add(p.title);
    if (p.committee) pool.add(p.committee);
    if (p.topic) pool.add(p.topic);
    if (p.keywords) {
      p.keywords.split(/[,;]/).forEach((k) => {
        const t = k.trim();
        if (t) pool.add(t);
      });
    }
  }

  return [...pool]
    .filter((s) => s.toLowerCase().includes(n))
    .sort((a, b) => {
      const al = a.toLowerCase();
      const bl = b.toLowerCase();
      const aStarts = al.startsWith(n) ? 0 : 1;
      const bStarts = bl.startsWith(n) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return al.localeCompare(bl);
    })
    .slice(0, limit);
}

export function distinctValues(items: PublicationMeta[]) {
  const committees = new Set<string>();
  const topics = new Set<string>();
  for (const p of items) {
    if (p.committee) committees.add(p.committee);
    if (p.topic) topics.add(p.topic);
  }
  return {
    committees: [...committees].sort(),
    topics: [...topics].sort(),
  };
}
