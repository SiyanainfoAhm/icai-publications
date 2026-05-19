-- SOW-aligned publication fields (run after 001_schema.sql)

ALTER TABLE icai_publications
  ADD COLUMN IF NOT EXISTS publication_type TEXT NOT NULL DEFAULT 'pdf_article',
  ADD COLUMN IF NOT EXISTS keywords TEXT,
  ADD COLUMN IF NOT EXISTS article_content TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS download_permission TEXT NOT NULL DEFAULT 'disabled',
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'authenticated_reader';

-- Backward compatibility: map legacy HTML column to article_content
UPDATE icai_publications
SET article_content = content_html
WHERE (article_content IS NULL OR article_content = '')
  AND content_html IS NOT NULL
  AND content_html <> '';

UPDATE icai_publications
SET pdf_file_url = file_url
WHERE pdf_file_url IS NULL AND file_url IS NOT NULL;

COMMENT ON COLUMN icai_publications.article_content IS 'Article / web page body; legacy rows may still use content_html.';
COMMENT ON COLUMN icai_publications.pdf_file_url IS 'Secure PDF storage path URL; legacy alias file_url.';

-- Demo catalogue defaults
UPDATE icai_publications
SET publication_type = 'pdf_article'
WHERE slug IN ('ca-journal-may-2026', 'handbook-audit-2026', 'gst-compendium-q1-2026');

UPDATE icai_publications
SET publication_type = 'web_page_article'
WHERE slug = 'draft-ethics-circular';
