import { NextRequest, NextResponse } from "next/server";
import { canReadPublications } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const user = await resolveSessionUser(getTokenFromRequest(request));

  if (!canReadPublications(user)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: pub, error } = await supabase
    .from("icai_publications")
    .select("id, slug, title, pdf_file_url, file_url, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !pub) {
    return NextResponse.json({ error: "Publication not found" }, { status: 404 });
  }

  if (pub.status === "hidden" || pub.status === "archived" || pub.status === "draft") {
    return NextResponse.json({ error: "Publication not available" }, { status: 404 });
  }

  const pdfUrl = (pub.pdf_file_url as string) ?? (pub.file_url as string);
  if (!pdfUrl) {
    return NextResponse.json({ error: "No PDF available" }, { status: 404 });
  }

  await supabase.from("icai_publication_access_logs").insert({
    user_id: user!.id,
    publication_id: pub.id,
    access_type: "pdf_download",
    ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.redirect(pdfUrl);
}
