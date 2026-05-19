import { NextRequest } from "next/server";
import { buildExcelBuffer, excelResponse } from "@/lib/admin/excel-export";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { formatDateTime, formatRole } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const USER_EXPORT_COLUMNS = [
  { key: "email", header: "Email", minWidth: 28, maxWidth: 50 },
  { key: "name", header: "Name", minWidth: 18, maxWidth: 36 },
  { key: "role", header: "Role", minWidth: 16, maxWidth: 28 },
  { key: "status", header: "Status", minWidth: 10, maxWidth: 14 },
  { key: "registered", header: "Registered", minWidth: 22, maxWidth: 28 },
] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  const roleFilter = request.nextUrl.searchParams.get("role") ?? "";

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("icai_users")
    .select("email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }

  const { data, error } = await query;
  if (error) {
    return new Response("Export failed", { status: 500 });
  }

  let users = data ?? [];
  if (q) {
    users = users.filter(
      (row) =>
        row.email.toLowerCase().includes(q) ||
        (row.full_name ?? "").toLowerCase().includes(q),
    );
  }

  const rows = users.map((row) => ({
    email: row.email,
    name: row.full_name ?? "",
    role: formatRole(row.role),
    status: row.is_active ? "Active" : "Blocked",
    registered: formatDateTime(row.created_at),
  }));

  const buffer = await buildExcelBuffer("Users", rows, [...USER_EXPORT_COLUMNS]);
  return excelResponse("icai-users.xlsx", buffer);
}
