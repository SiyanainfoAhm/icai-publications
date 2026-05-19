import { NextRequest } from "next/server";
import { buildExcelBuffer, excelResponse } from "@/lib/admin/excel-export";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ACCESS_EXPORT_COLUMNS = [
  { key: "when", header: "When", minWidth: 22, maxWidth: 28 },
  { key: "publication", header: "Publication", minWidth: 24, maxWidth: 48 },
  { key: "committee", header: "Committee", minWidth: 20, maxWidth: 40 },
  { key: "reader", header: "Reader email", minWidth: 28, maxWidth: 50 },
  { key: "userType", header: "User type", minWidth: 14, maxWidth: 22 },
  { key: "accessType", header: "Access type", minWidth: 12, maxWidth: 18 },
] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("icai_publication_access_logs")
    .select(
      `accessed_at, access_type,
      publication:icai_publications ( title, committee ),
      user:icai_users ( email, role )`,
    )
    .order("accessed_at", { ascending: false })
    .limit(5000);

  if (from) query = query.gte("accessed_at", from);
  if (to) query = query.lte("accessed_at", `${to}T23:59:59`);

  const { data, error } = await query;
  if (error) {
    return new Response("Export failed", { status: 500 });
  }

  const rows = (data ?? []).map((row) => {
    const pub = row.publication as { title?: string; committee?: string } | null;
    const u = row.user as { email?: string; role?: string } | null;
    return {
      when: formatDateTime(row.accessed_at as string),
      publication: pub?.title ?? "",
      committee: pub?.committee ?? "",
      reader: u?.email ?? "",
      userType: u?.role ?? "",
      accessType: (row.access_type as string) ?? "read",
    };
  });

  const buffer = await buildExcelBuffer("Access report", rows, [...ACCESS_EXPORT_COLUMNS]);
  return excelResponse("icai-access-report.xlsx", buffer);
}
