import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PublicationStatus } from "@/lib/types";

const ALLOWED: PublicationStatus[] = ["draft", "published", "hidden", "archived"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.status && ALLOWED.includes(body.status)) {
    updates.status = body.status;
  }
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.synopsis === "string") updates.synopsis = body.synopsis;
  if (typeof body.content_html === "string") updates.content_html = body.content_html;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_publications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ publication: data });
}
