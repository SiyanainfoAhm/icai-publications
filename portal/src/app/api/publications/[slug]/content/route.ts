import { NextRequest, NextResponse } from "next/server";
import { canReadPublications } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import { resolveArticleContent } from "@/lib/publication-sow";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = getTokenFromRequest(request);
  const user = await resolveSessionUser(token);

  if (!canReadPublications(user)) {
    return NextResponse.json(
      { error: "Authentication required to read full publication" },
      { status: 401 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: pub, error } = await supabase
      .from("icai_publications")
      .select("id, slug, title, content_html, article_content, status")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!pub || pub.status !== "published") {
      return NextResponse.json({ error: "Publication not available" }, { status: 404 });
    }

    const meta = request.headers;
    await supabase.from("icai_publication_access_logs").insert({
      user_id: user!.id,
      publication_id: pub.id,
      access_type: "read",
      ip_address:
        meta.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        meta.get("x-real-ip"),
      user_agent: meta.get("user-agent"),
    });

    return NextResponse.json({
      publication: {
        slug: pub.slug,
        title: pub.title,
        content_html: resolveArticleContent(pub),
      },
    });
  } catch (err) {
    console.error("Publication content error:", err);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
