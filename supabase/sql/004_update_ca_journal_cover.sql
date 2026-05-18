-- Point CA Journal demo to the PNG cover in portal/public/covers (or covers/ via junction)
UPDATE icai_publications
SET cover_image_url = '/covers/ca-journal.png',
    updated_at = now()
WHERE slug = 'ca-journal-may-2026';
