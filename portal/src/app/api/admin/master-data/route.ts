import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const supabase = getSupabaseAdmin();
  const [committees, topics] = await Promise.all([
    supabase.from("icai_master_committees").select("id, name, is_active").order("name"),
    supabase.from("icai_master_topics").select("id, name, is_active").order("name"),
  ]);

  if (committees.error || topics.error) {
    return NextResponse.json({
      committees: [],
      topics: [],
      demo: true,
    });
  }

  return NextResponse.json({
    committees: committees.data ?? [],
    topics: topics.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  if (body.type === "committee" && typeof body.name === "string") {
    const { data, error } = await supabase
      .from("icai_master_committees")
      .insert({ name: body.name.trim() })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ item: data });
  }

  if (body.type === "topic" && typeof body.name === "string") {
    const { data, error } = await supabase
      .from("icai_master_topics")
      .insert({ name: body.name.trim() })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ item: data });
  }

  return NextResponse.json({ error: "Invalid master data request" }, { status: 400 });
}
