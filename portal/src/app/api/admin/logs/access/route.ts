import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_publication_access_logs")
    .select(
      `
      accessed_at,
      publication:icai_publications ( title ),
      user:icai_users ( email, full_name )
    `,
    )
    .order("accessed_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: "Unable to load access log." }, { status: 500 });
  }

  const logs = (data ?? []).map((row) => {
    const publication = row.publication as { title?: string } | null;
    const reader = row.user as { email?: string; full_name?: string | null } | null;
    const name = reader?.full_name?.trim();
    return {
      when: formatDateTime(row.accessed_at as string),
      publication: publication?.title ?? "—",
      reader: name ? `${name} (${reader?.email})` : (reader?.email ?? "—"),
    };
  });

  return NextResponse.json({ logs });
}
