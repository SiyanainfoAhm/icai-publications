import { NextRequest, NextResponse } from "next/server";
import { isPubliclyListed, PUBLIC_META_FIELDS, toPublicationMeta } from "@/lib/publications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("icai_publications")
      .select(PUBLIC_META_FIELDS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data || !isPubliclyListed(data.status)) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }

    return NextResponse.json({ publication: toPublicationMeta(data) });
  } catch (err) {
    console.error("Publication meta error:", err);
    return NextResponse.json({ error: "Failed to load publication" }, { status: 500 });
  }
}
