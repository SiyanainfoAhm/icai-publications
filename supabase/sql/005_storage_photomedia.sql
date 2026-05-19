-- photomedia bucket for publication covers and other media
-- Path convention: publications/<publication_uuid>/cover.<ext>

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photomedia',
  'photomedia',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for catalogue covers (service role uploads via API)
DO $$ BEGIN
  CREATE POLICY "Public read photomedia"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'photomedia');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
