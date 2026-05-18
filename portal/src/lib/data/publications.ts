import {
  isPubliclyListed,
  PUBLIC_META_FIELDS,
  toPublicationMeta,
} from "@/lib/publications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PublicationMeta } from "@/lib/types";

export async function fetchPublishedCatalogue(): Promise<PublicationMeta[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("icai_publications")
      .select(PUBLIC_META_FIELDS)
      .eq("status", "published")
      .order("release_date", { ascending: false });

    if (error) throw error;
    return (data ?? [])
      .filter((row) => isPubliclyListed(row.status))
      .map((row) => toPublicationMeta(row));
  } catch {
    return [];
  }
}

export async function fetchPublicationBySlug(
  slug: string,
): Promise<PublicationMeta | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("icai_publications")
      .select(PUBLIC_META_FIELDS)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data || !isPubliclyListed(data.status)) return null;
    return toPublicationMeta(data);
  } catch {
    return null;
  }
}
