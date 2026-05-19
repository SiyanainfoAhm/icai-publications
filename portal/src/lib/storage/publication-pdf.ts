import type { SupabaseClient } from "@supabase/supabase-js";
import { PHOTOMEDIA_BUCKET } from "@/lib/storage/publication-cover";

const MAX_PDF_BYTES = 25 * 1024 * 1024;

export function publicationPdfObjectPath(publicationId: string): string {
  return `publications/${publicationId}/document.pdf`;
}

export function validatePdfFile(file: File): string | null {
  if (!file.size) return "PDF file is empty";
  if (file.size > MAX_PDF_BYTES) return "PDF must be 25 MB or smaller";
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "PDF file must be a .pdf document";
  }
  return null;
}

export async function uploadPublicationPdf(
  supabase: SupabaseClient,
  publicationId: string,
  file: File,
): Promise<{ publicUrl: string; objectPath: string }> {
  const objectPath = publicationPdfObjectPath(publicationId);
  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/pdf";

  const { error } = await supabase.storage.from(PHOTOMEDIA_BUCKET).upload(objectPath, bytes, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(PHOTOMEDIA_BUCKET).getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl, objectPath };
}
