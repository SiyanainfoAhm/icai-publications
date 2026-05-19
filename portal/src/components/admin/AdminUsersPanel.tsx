"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface UserRow {
  id: string;
  email: string;
  name: string;
  accountType: string;
  role: string;
  status: string;
  is_active: boolean;
  registered: string;
}

export function AdminUsersPanel() {
  const { toast } = useToast();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const exportHref = (() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    const qs = params.toString();
    return qs ? `/api/admin/users/export?${qs}` : "/api/admin/users/export";
  })();

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    fetch(`/api/admin/users?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRows(d.users ?? []))
      .finally(() => setLoading(false));
  }, [q, role]);

  useEffect(() => {
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  async function toggleActive(row: UserRow) {
    const res = await fetch(`/api/admin/users/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !row.is_active }),
    });
    if (!res.ok) {
      toast("Could not update user", "error");
      return;
    }
    toast(row.is_active ? `${row.email} blocked.` : `${row.email} activated.`, "success");
    load();
  }

  return (
    <>
      <div className="admin-toolbar">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Email or name…"
            className="icai-field-input w-56"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Account type</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="icai-field-input w-40"
          >
            <option value="">All</option>
            <option value="non_member">Non-member</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <a href={exportHref} className="icai-file-btn">
          Export Excel
        </a>
        <a href="/admin/logs/access" className="icai-file-btn">
          Access history
        </a>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading users…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-email">Email</th>
                <th className="col-name">Name</th>
                <th className="col-type">Type</th>
                <th className="col-status">Status</th>
                <th className="col-date">Registered</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="col-email">{row.email}</td>
                  <td className="col-name">{row.name}</td>
                  <td className="col-type">{row.accountType}</td>
                  <td className="col-status">{row.status}</td>
                  <td className="col-date">{row.registered}</td>
                  <td className="col-actions">
                    <button
                      type="button"
                      onClick={() => toggleActive(row)}
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        row.is_active
                          ? "border border-red-300 text-red-700 hover:bg-red-50"
                          : "border border-green-600 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {row.is_active ? "Block" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
