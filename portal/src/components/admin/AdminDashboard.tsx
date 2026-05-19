"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardData {
  source: string;
  fetchedAt: string;
  stats: {
    totalUsers: number;
    activeUsers: number;
    nonMembers: number;
    activeSessions: number;
    totalPublications: number;
    otpAttempts30d: number;
    otpVerified30d: number;
    accessEvents30d: number;
  };
  publicationsByStatus: Record<string, number>;
  publicationsByType: { type: string; count: number }[];
  topPublications: { title: string; reads: number }[];
  registrationTrend: { date: string; count: number }[];
  loginTrend: { date: string; count: number }[];
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [migrationHint, setMigrationHint] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics/dashboard", { credentials: "include" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          const detail = Array.isArray(d.details) ? d.details.join(" ") : "";
          setMigrationHint(typeof d.migrationHint === "string" ? d.migrationHint : null);
          throw new Error(d.error ? `${d.error} ${detail}`.trim() : "Database request failed");
        }
        setMigrationHint(null);
        return d as DashboardData;
      })
      .then((d) => setData(d))
      .catch((e: Error) => setError(e.message || "Could not load analytics from database"));
  }, []);

  if (error) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
        {migrationHint ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
            <strong className="block font-semibold text-[var(--icai-navy)]">Fix</strong>
            {migrationHint}
          </p>
        ) : null}
      </div>
    );
  }

  if (!data) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  const maxReads = Math.max(...data.topPublications.map((p) => p.reads), 1);
  const maxReg = Math.max(...data.registrationTrend.map((d) => d.count), 1);
  const maxLogin = Math.max(...data.loginTrend.map((d) => d.count), 1);

  const fetchedLabel = data.fetchedAt
    ? new Date(data.fetchedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="admin-dashboard">
      <p className="mb-4 text-xs text-slate-500">
        Live data from Supabase{fetchedLabel ? ` · updated ${fetchedLabel}` : ""}
      </p>
      <div className="admin-stat-grid">
        <StatCard label="Total users" value={data.stats.totalUsers} hint="All portal accounts" />
        <StatCard
          label="Active sessions"
          value={data.stats.activeSessions}
          hint="Non-revoked sessions"
          accent="gold"
        />
        <StatCard
          label="Publications"
          value={data.stats.totalPublications}
          hint="Catalogue items"
        />
        <StatCard
          label="Non-members"
          value={data.stats.nonMembers}
          hint="OTP-registered visitors"
        />
        <StatCard
          label="Reads (30d)"
          value={data.stats.accessEvents30d}
          hint="Publication access events"
        />
        <StatCard
          label="OTP verified (30d)"
          value={data.stats.otpVerified30d}
          hint={`${data.stats.otpAttempts30d} attempts`}
        />
      </div>

      <div className="admin-panel-grid">
        <section className="admin-panel">
          <h2 className="admin-panel-title">Top publications (last 30 days)</h2>
          {data.topPublications.length === 0 ? (
            <p className="text-sm text-slate-500">
              No reads logged in the last 30 days. Open a publication as a signed-in user to
              record access.
            </p>
          ) : (
            <ul className="admin-bar-list">
              {data.topPublications.map((p) => (
                <li key={p.title}>
                  <span className="admin-bar-label">{p.title}</span>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill"
                      style={{ width: `${(p.reads / maxReads) * 100}%` }}
                    />
                  </div>
                  <span className="admin-bar-value">{p.reads}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">By status</h2>
          <ul className="admin-status-list">
            {Object.entries(data.publicationsByStatus).map(([status, count]) => (
              <li key={status}>
                <span className="capitalize">{status}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
          <h3 className="admin-panel-subtitle">By type</h3>
          <ul className="admin-status-list">
            {data.publicationsByType.map(({ type, count }) => (
              <li key={type}>
                <span>{type}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">New users (last 14 days)</h2>
          <div className="admin-mini-chart">
            {data.registrationTrend.every((d) => d.count === 0) ? (
              <p className="w-full text-center text-xs text-slate-500">No new users in this period</p>
            ) : (
              data.registrationTrend.map((d) => (
              <div
                key={d.date}
                className="admin-mini-bar"
                title={`${d.date}: ${d.count}`}
              >
                <div
                  className="admin-mini-bar-fill admin-mini-bar-fill--navy"
                  style={{ height: `${Math.max(8, (d.count / maxReg) * 100)}%` }}
                />
                <span className="admin-mini-bar-label">
                  {d.date.slice(5)}
                </span>
              </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">New sessions (last 14 days)</h2>
          <div className="admin-mini-chart">
            {data.loginTrend.every((d) => d.count === 0) ? (
              <p className="w-full text-center text-xs text-slate-500">No sign-ins in this period</p>
            ) : (
              data.loginTrend.map((d) => (
              <div key={d.date} className="admin-mini-bar" title={`${d.date}: ${d.count}`}>
                <div
                  className="admin-mini-bar-fill admin-mini-bar-fill--gold"
                  style={{ height: `${Math.max(8, (d.count / maxLogin) * 100)}%` }}
                />
                <span className="admin-mini-bar-label">{d.date.slice(5)}</span>
              </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="admin-quick-actions">
        <h2 className="admin-panel-title">CMS quick actions</h2>
        <div className="admin-quick-grid">
          {[
            { href: "/admin/publications/new", title: "Upload publication", desc: "PDF, article, or both" },
            { href: "/admin/publications/bulk", title: "Bulk upload", desc: "Multiple publications" },
            { href: "/admin/publications", title: "Manage publications", desc: "Search, hide, archive, delete" },
            { href: "/admin/users", title: "User management", desc: "Search, block, export CSV" },
            { href: "/admin/reports", title: "Analytics & reports", desc: "Export access reports" },
            { href: "/admin/settings", title: "System settings", desc: "OTP, session, master data" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="admin-quick-card">
              <span className="font-semibold text-[var(--icai-navy)]">{item.title}</span>
              <span className="mt-1 text-xs text-slate-600">{item.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent?: "gold";
}) {
  return (
    <div className={`admin-stat-card ${accent === "gold" ? "admin-stat-card--gold" : ""}`}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value.toLocaleString("en-IN")}</p>
      <p className="admin-stat-hint">{hint}</p>
    </div>
  );
}
