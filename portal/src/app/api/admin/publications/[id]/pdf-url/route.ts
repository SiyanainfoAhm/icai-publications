import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Returns session-gated PDF access URL (not direct storage URL). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_publications")
    .select("id, slug, title, pdf_file_url, file_url")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Publication not found" }, { status: 404 });
  }

  const storageUrl = (data.pdf_file_url as string) ?? (data.file_url as string) ?? null;
  if (!storageUrl) {
    return NextResponse.json({ error: "No PDF uploaded for this publication" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const authorizedUrl = `${origin}/api/publications/${data.slug}/pdf`;

  return NextResponse.json({
    publicationId: data.id,
    title: data.title,
    slug: data.slug,
    storagePath: storageUrl,
    authorizedUrl,
    note: "Share only the authorized URL. Access requires a valid portal session.",
  });
}
