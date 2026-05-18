"use client";

import { useEffect, useState } from "react";

export function AdminDataTable({
  title,
  endpoint,
  columns,
  emptyMessage = "No records to display.",
}: {
  title: string;
  endpoint: string;
  columns: { key: string; label: string }[];
  emptyMessage?: string;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const key = Object.keys(d).find((k) => Array.isArray(d[k]));
        const list = key ? (d[key] as Record<string, string>[]) : [];
        setRows(list);
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <>
      <h1 className="text-2xl font-bold text-[var(--icai-navy)]">{title}</h1>
      {loading ? (
        <p className="mt-6 text-slate-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-slate-600">{emptyMessage}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-slate-600">
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-slate-800">
                      {row[c.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
