import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import { PUBLIC_META_FIELDS } from "@/lib/publications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_publications")
    .select(`${PUBLIC_META_FIELDS}, created_at, updated_at`)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ publications: data ?? [] });
}

export async function POST(request: NextRequest) {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;

  const body = await request.json();
  const title = (body.title as string)?.trim();
  const slug = (body.slug as string)?.trim().toLowerCase();

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_publications")
    .insert({
      slug,
      title,
      committee: body.committee ?? null,
      topic: body.topic ?? null,
      cover_image_url: body.cover_image_url ?? null,
      synopsis: body.synopsis ?? null,
      release_date: body.release_date ?? null,
      content_html: body.content_html ?? "<p></p>",
      status: body.status ?? "draft",
      created_by: user!.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ publication: data }, { status: 201 });
}
