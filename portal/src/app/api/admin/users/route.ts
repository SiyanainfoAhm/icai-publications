import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { formatDateTime, formatRole } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  const roleFilter = request.nextUrl.searchParams.get("role") ?? "";

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("icai_users")
    .select("id, email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Unable to load users." }, { status: 500 });
  }

  let users = data ?? [];
  if (q) {
    users = users.filter(
      (row) =>
        row.email.toLowerCase().includes(q) ||
        (row.full_name ?? "").toLowerCase().includes(q),
    );
  }

  const mapped = users.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.full_name ?? "—",
    accountType: formatRole(row.role),
    role: row.role,
    status: row.is_active ? "Active" : "Blocked",
    is_active: row.is_active,
    registered: formatDateTime(row.created_at),
  }));

  return NextResponse.json({ users: mapped });
}
