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

const HANDBOOK_AUDIT_2026: FlipbookPage[] = [
  {
    page: 0,
    label: "Cover",
    headline: "Handbook on Audit & Assurance 2026",
    body: "Auditing & Assurance Standards Board, ICAI.",
  },
  {
    page: 1,
    label: "Scope",
    headline: "Scope of the handbook",
    body: "This handbook collates SA standards, implementation guidance, and illustrative formats for engagement letters and audit reports effective for periods beginning on or after 1 April 2026.",
  },
  {
    page: 2,
    label: "Quality management",
    headline: "Quality management (SQMs)",
    body: "Firms shall establish policies aligned with SQMs addressing leadership, ethics, acceptance, and monitoring of audit quality.",
  },
  {
    page: 3,
    label: "SA standards",
    headline: "Standards on Auditing — key themes",
    body: "Risk assessment, responses, evidence, and documentation requirements for audits of financial statements under the Companies Act framework.",
  },
  {
    page: 4,
    label: "Reporting",
    headline: "Audit reporting and communication",
    body: "Illustrative audit report formats, emphasis-of-matter paragraphs, and communication with those charged with governance.",
  },
];

const GST_COMPENDIUM_Q1_2026: FlipbookPage[] = [
  {
    page: 0,
    label: "Cover",
    headline: "GST Compendium — Q1 2026",
    body: "GST & Indirect Taxes Committee, ICAI.",
  },
  {
    page: 1,
    label: "Notifications",
    headline: "Notifications index",
    body: "Indexed summaries of central tax notifications with cross-references to relevant sections of the CGST Act for Q1 2026.",
  },
  {
    page: 2,
    label: "ITC & compliance",
    headline: "Input tax credit and compliance",
    body: "Practical checklists on ITC eligibility, reversal triggers, and reconciliation for monthly and annual returns.",
  },
  {
    page: 3,
    label: "Case studies",
    headline: "Case studies",
    body: "Illustrative scenarios on ITC reversal, export refunds, and e-invoicing thresholds for practitioners and industry teams.",
  },
];

const ISSUES: Record<string, FlipbookPage[]> = {
  "ca-journal-may-2026": CA_JOURNAL_MAY_2026,
  "handbook-audit-2026": HANDBOOK_AUDIT_2026,
  "gst-compendium-q1-2026": GST_COMPENDIUM_Q1_2026,
};

export type FlipbookMeta = {
  title: string;
  synopsis?: string | null;
  topic?: string | null;
  committee?: string | null;
};

function buildFallbackFlipbook(meta: FlipbookMeta): FlipbookPage[] {
  const synopsis =
    meta.synopsis?.trim() ||
    "Demo flipbook view. Full PDF delivery will be available in production.";
  return [
    {
      page: 0,
      label: "Cover",
      headline: meta.title,
      body: synopsis,
    },
    {
      page: 1,
      label: meta.topic || "Overview",
      headline: meta.topic || "Overview",
      body: synopsis,
    },
    {
      page: 2,
      label: meta.committee || "ICAI",
      headline: meta.committee || "Institute of Chartered Accountants of India",
      body: "Authenticated session access. Print and download are disabled in the demo reader.",
    },
  ];
}

export function getFlipbookPages(slug: string): FlipbookPage[] | null {
  return ISSUES[slug] ?? null;
}

export function resolveFlipbookPages(slug: string, meta?: FlipbookMeta): FlipbookPage[] {
  const pages = getFlipbookPages(slug);
  if (pages?.length) return pages;
  if (!meta) return [];
  return buildFallbackFlipbook(meta);
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
