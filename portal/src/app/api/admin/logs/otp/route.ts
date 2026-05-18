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
    .from("icai_otp_logs")
    .select("email, expires_at, attempts, max_attempts, verified, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: "Unable to load verification log." }, { status: 500 });
  }

  const logs = (data ?? []).map((row) => ({
    email: row.email,
    requested: formatDateTime(row.created_at),
    expires: formatDateTime(row.expires_at),
    attempts: `${row.attempts} of ${row.max_attempts}`,
    status: row.verified ? "Verified" : row.attempts >= row.max_attempts ? "Locked" : "Pending",
  }));

  return NextResponse.json({ logs });
}
