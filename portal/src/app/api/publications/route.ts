import { NextResponse } from "next/server";
import { isPubliclyListed, PUBLIC_META_FIELDS, toPublicationMeta } from "@/lib/publications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Public catalogue — metadata only for published items */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("icai_publications")
      .select(PUBLIC_META_FIELDS)
      .eq("status", "published")
      .order("release_date", { ascending: false });

    if (error) throw error;

    const publications = (data ?? [])
      .filter((row) => isPubliclyListed(row.status))
      .map((row) => toPublicationMeta(row));

    return NextResponse.json({ publications });
  } catch (err) {
    console.error("Publications list error:", err);
    return NextResponse.json({ error: "Failed to load publications" }, { status: 500 });
  }
}
