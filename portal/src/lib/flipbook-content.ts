export type FlipbookPage = {
  page: number;
  label: string;
  headline: string;
  body: string;
};

export type FlipbookIssue = {
  slug: string;
  pages: FlipbookPage[];
};

const CA_JOURNAL_MAY_2026: FlipbookPage[] = [
  {
    page: 0,
    label: "Cover",
    headline: "Cover — The Chartered Accountant Journal",
    body: "May 2026 issue. Institute of Chartered Accountants of India.",
  },
  {
    page: 1,
    label: "Editorial",
    headline: "Editorial — Profession in a regulated digital economy",
    body: "Editorial on ethics, technology adoption, and member responsibilities in a digital economy.",
  },
  {
    page: 2,
    label: "GST — Updates & compliance",
    headline: "GST — Judicial updates, ITC, and compliance toolkit",
    body: "GST updates covering input tax credit, judicial pronouncements, and compliance checklists for practitioners.",
  },
  {
    page: 3,
    label: "Audit — Standards & documentation",
    headline: "Audit — SA standards and documentation discipline",
    body: "Auditing and assurance standards, documentation requirements, and quality management for audit engagements.",
  },
  {
    page: 4,
    label: "Corporate Law",
    headline: "Corporate Law — Companies Act and MCA updates",
    body: "Corporate law updates under the Companies Act and MCA circulars affecting financial reporting.",
  },
  {
    page: 5,
    label: "Accounting Standards",
    headline: "Accounting Standards — Ind AS and disclosures",
    body: "Ind AS financial reporting, disclosure requirements, and financial reporting updates.",
  },
  {
    page: 6,
    label: "Technology",
    headline: "Technology — AI governance for practice firms",
    body: "Technology and AI governance guidance for chartered accountancy practice firms.",
  },
  {
    page: 7,
    label: "Sustainability",
    headline: "Sustainability — BRSR and assurance readiness",
    body: "Sustainability reporting, BRSR framework, and assurance readiness for listed entities.",
  },
];

const ISSUES: Record<string, FlipbookPage[]> = {
  "ca-journal-may-2026": CA_JOURNAL_MAY_2026,
};

export function getFlipbookPages(slug: string): FlipbookPage[] | null {
  return ISSUES[slug] ?? null;
}

export function searchFlipbookPages(
  slug: string,
  query: string,
): { page: number; label: string; snippet: string; score: number }[] {
  const pages = getFlipbookPages(slug);
  if (!pages || !query.trim()) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const hits: { page: number; label: string; snippet: string; score: number }[] = [];

  for (const p of pages) {
    const hay = `${p.label} ${p.headline} ${p.body}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += t.length > 3 ? 3 : 1;
    }
    if (score === 0) continue;

    const firstTerm = terms[0];
    const idx = hay.indexOf(firstTerm);
    const source = `${p.headline}. ${p.body}`;
    let snippet = source;
    if (idx >= 0) {
      const start = Math.max(0, idx - 40);
      snippet = (start > 0 ? "…" : "") + source.slice(start, start + 120) + "…";
    }

    hits.push({ page: p.page, label: p.label, snippet, score });
  }

  return hits.sort((a, b) => b.score - a.score);
}
