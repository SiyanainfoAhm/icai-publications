import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import { formatDateTime, formatRole } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_users")
    .select("email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load users." }, { status: 500 });
  }

  const users = (data ?? []).map((row) => ({
    email: row.email,
    name: row.full_name ?? "—",
    accountType: formatRole(row.role),
    status: row.is_active ? "Active" : "Inactive",
    registered: formatDateTime(row.created_at),
  }));

  return NextResponse.json({ users });
}
