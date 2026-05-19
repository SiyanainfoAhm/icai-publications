import type { SupabaseClient } from "@supabase/supabase-js";

export const PHOTOMEDIA_BUCKET = "photomedia";

const MAX_COVER_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function publicationCoverObjectPath(publicationId: string, ext: string): string {
  return `publications/${publicationId}/cover.${ext}`;
}

export function coverExtensionFromMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null;
}

export function validateCoverFile(file: File): string | null {
  if (!file.size) return "Cover image file is empty";
  if (file.size > MAX_COVER_BYTES) return "Cover image must be 5 MB or smaller";
  if (!coverExtensionFromMime(file.type)) {
    return "Cover image must be JPEG, PNG, WebP, or GIF";
  }
  return null;
}

export async function uploadPublicationCover(
  supabase: SupabaseClient,
  publicationId: string,
  file: File,
): Promise<{ publicUrl: string; objectPath: string }> {
  const ext = coverExtensionFromMime(file.type);
  if (!ext) {
    throw new Error("Unsupported cover image type");
  }

  const objectPath = publicationCoverObjectPath(publicationId, ext);
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(PHOTOMEDIA_BUCKET).upload(objectPath, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(PHOTOMEDIA_BUCKET).getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl, objectPath };
}
