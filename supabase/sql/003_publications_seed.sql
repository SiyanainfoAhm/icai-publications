-- Demo ICAI publications (run after ca-journal-poc/supabase/sql/001_schema.sql)
-- Cover assets: ../covers/  |  HTML source: ../content/{slug}.html

INSERT INTO icai_publications (
  slug, title, committee, topic, cover_image_url, synopsis, release_date, content_html, status
)
VALUES
  (
    'ca-journal-may-2026',
    'The Chartered Accountant Journal — May 2026',
    'Board of Studies',
    'Professional Updates',
    '/covers/ca-journal.png',
    'Monthly flagship journal covering auditing standards, GST developments, corporate governance, and professional ethics for members and students.',
    '2026-05-01',
    '<article class="icai-reader-content"><h1>The Chartered Accountant Journal — May 2026</h1><p class="lead">Institute of Chartered Accountants of India — official monthly publication.</p><h2>Editorial</h2><p>This issue consolidates guidance on emerging regulatory themes, committee reports, and technical articles curated for the profession.</p><h2>Highlights</h2><ul><li>Auditing Standards: key amendments and implementation timelines</li><li>GST: recent circulars and compliance checklist for practitioners</li><li>Ethics: professional conduct in digital practice environments</li></ul><h2>Committee Report — GST &amp; Indirect Taxes</h2><p>The committee summarizes recent CBIC notifications and illustrative disclosures for listed entities preparing Q4 filings.</p><p><em>Demo content only. Full PDF and archival issues will be served from the production document repository.</em></p></article>',
    'published'
  ),
  (
    'handbook-audit-2026',
    'Handbook on Audit & Assurance 2026',
    'Auditing & Assurance Standards Board',
    'Audit & Assurance',
    '/covers/handbook-audit-2026.svg',
    'Comprehensive reference for auditors on standards, quality management, and reporting obligations effective for audits of financial statements for periods beginning on or after 1 April 2026.',
    '2026-04-15',
    '<article class="icai-reader-content"><h1>Handbook on Audit &amp; Assurance 2026</h1><p>Published by the Auditing &amp; Assurance Standards Board, ICAI.</p><h2>Scope</h2><p>This handbook collates SA standards, implementation guidance, and illustrative formats for engagement letters and audit reports.</p><h2>Quality Management</h2><p>Firms shall establish policies aligned with SQMs addressing leadership, ethics, acceptance, and monitoring.</p><p><em>Restricted to authenticated readers in production. Demo HTML reader only.</em></p></article>',
    'published'
  ),
  (
    'gst-compendium-q1-2026',
    'GST Compendium — Q1 2026',
    'GST & Indirect Taxes Committee',
    'GST',
    '/covers/gst-compendium.svg',
    'Quarterly compendium of GST notifications, FAQs, and worked examples for practitioners and industry finance teams.',
    '2026-03-20',
    '<article class="icai-reader-content"><h1>GST Compendium — Q1 2026</h1><p>Prepared by the GST &amp; Indirect Taxes Committee.</p><h2>Notifications Index</h2><p>Indexed summaries of central tax notifications with cross-references to relevant sections of the CGST Act.</p><h2>Case Studies</h2><p>Three illustrative scenarios on ITC reversal, export refunds, and e-invoicing thresholds.</p></article>',
    'published'
  ),
  (
    'draft-ethics-circular',
    'Draft Ethics Circular (Internal)',
    'Ethics Committee',
    'Professional Ethics',
    '/covers/ethics-draft.svg',
    'Internal draft — not for public distribution until approved by Council.',
    NULL,
    '<article><p>Draft content for editorial workflow demonstration.</p></article>',
    'draft'
  )
ON CONFLICT (slug) DO UPDATE SET
  cover_image_url = EXCLUDED.cover_image_url,
  title = EXCLUDED.title,
  synopsis = EXCLUDED.synopsis,
  updated_at = now();
