import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { formatPublicationType } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MS_30D = 30 * 24 * 60 * 60 * 1000;
const MS_14D = 14 * 24 * 60 * 60 * 1000;
const MS_90D = 90 * 24 * 60 * 60 * 1000;

function lastNDayBuckets(
  days: number,
  rows: { created_at: string }[],
): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const d = row.created_at.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const since30d = new Date(Date.now() - MS_30D).toISOString();
  const since90d = new Date(Date.now() - MS_90D).toISOString();
  const since14d = new Date(Date.now() - MS_14D).toISOString();

  const [
    usersRes,
    activeSessionsRes,
    pubsRes,
    access30dCountRes,
    access30dRowsRes,
    otpRes,
    users90dRes,
    sessions14dRes,
  ] = await Promise.all([
    supabase.from("icai_users").select("id, role, is_active", { count: "exact" }),
    supabase
      .from("icai_sessions")
      .select("id", { count: "exact", head: true })
      .eq("revoked", false)
      .gt("expires_at", now),
    supabase.from("icai_publications").select("id, status, publication_type"),
    supabase
      .from("icai_publication_access_logs")
      .select("id", { count: "exact", head: true })
      .gte("accessed_at", since30d),
    supabase
      .from("icai_publication_access_logs")
      .select("publication_id")
      .gte("accessed_at", since30d)
      .order("accessed_at", { ascending: false })
      .limit(5000),
    supabase
      .from("icai_otp_logs")
      .select("id, verified")
      .gte("created_at", since30d),
    supabase.from("icai_users").select("created_at").gte("created_at", since90d),
    supabase.from("icai_sessions").select("created_at").gte("created_at", since14d),
  ]);

  const errors: string[] = [];
  if (usersRes.error) errors.push(`users: ${usersRes.error.message}`);
  if (activeSessionsRes.error) errors.push(`sessions: ${activeSessionsRes.error.message}`);
  if (pubsRes.error) errors.push(`publications: ${pubsRes.error.message}`);
  if (access30dCountRes.error) errors.push(`access logs: ${access30dCountRes.error.message}`);
  if (otpRes.error) errors.push(`otp logs: ${otpRes.error.message}`);

  if (errors.length > 0) {
    const needsSowMigration = errors.some((e) =>
      /publication_type|article_content|pdf_file_url|is_featured|download_permission|visibility/i.test(
        e,
      ),
    );
    return NextResponse.json(
      {
        error: "Could not load dashboard from database.",
        details: errors,
        ...(needsSowMigration && {
          migrationHint:
            "Run supabase/sql/006_publication_sow_fields.sql in the Supabase SQL Editor (Dashboard → SQL → New query), then refresh this page. If you use admin settings, also run 007_admin_cms.sql.",
        }),
      },
      { status: 500 },
    );
  }

  const users = usersRes.data ?? [];
  const publications = pubsRes.data ?? [];
  const access30dRows = access30dRowsRes.data ?? [];
  const otpLogs = otpRes.data ?? [];

  const accessByPub = new Map<string, number>();
  for (const log of access30dRows) {
    if (!log.publication_id) continue;
    accessByPub.set(log.publication_id, (accessByPub.get(log.publication_id) ?? 0) + 1);
  }

  const topIds = [...accessByPub.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const pubTitles = new Map<string, string>();
  if (topIds.length > 0) {
    const { data: pubRows, error: titleErr } = await supabase
      .from("icai_publications")
      .select("id, title")
      .in("id", topIds);
    if (titleErr) {
      errors.push(`publication titles: ${titleErr.message}`);
    } else {
      for (const p of pubRows ?? []) pubTitles.set(p.id, p.title);
    }
  }

  const topPublications = topIds.map((id) => ({
    title: pubTitles.get(id) ?? "Unknown publication",
    reads: accessByPub.get(id) ?? 0,
  }));

  const byStatus = {
    published: publications.filter((p) => p.status === "published").length,
    draft: publications.filter((p) => p.status === "draft").length,
    hidden: publications.filter((p) => p.status === "hidden").length,
    archived: publications.filter((p) => p.status === "archived").length,
  };

  const byType = publications.reduce<Record<string, number>>((acc, p) => {
    const raw = p.publication_type as string | null | undefined;
    const label = raw ? formatPublicationType(raw as "pdf_publication") : "Not set";
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    source: "database",
    fetchedAt: new Date().toISOString(),
    stats: {
      totalUsers: usersRes.count ?? users.length,
      activeUsers: users.filter((u) => u.is_active).length,
      nonMembers: users.filter((u) => u.role === "non_member").length,
      activeSessions: activeSessionsRes.count ?? 0,
      totalPublications: publications.length,
      otpAttempts30d: otpLogs.length,
      otpVerified30d: otpLogs.filter((o) => o.verified).length,
      accessEvents30d: access30dCountRes.count ?? access30dRows.length,
    },
    publicationsByStatus: byStatus,
    publicationsByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    topPublications,
    registrationTrend: lastNDayBuckets(14, users90dRes.data ?? []),
    loginTrend: lastNDayBuckets(14, sessions14dRes.data ?? []),
  });
}
