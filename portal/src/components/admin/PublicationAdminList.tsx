"use client";

import { useEffect, useState } from "react";
import { formatPublicationStatus } from "@/lib/format";
import type { PublicationStatus } from "@/lib/types";

interface Row {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  release_date: string | null;
}

export function PublicationAdminList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/publications", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setRows(d.publications ?? []);
      });
  }

  useEffect(load, []);

  async function setStatus(id: string, status: PublicationStatus) {
    const res = await fetch(`/api/admin/publications/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  }

  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <table className="mt-6 w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2 pr-4">Title</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-slate-100">
            <td className="py-3 pr-4 font-medium text-[var(--icai-navy)]">{row.title}</td>
            <td className="py-3 pr-4">{formatPublicationStatus(row.status)}</td>
            <td className="py-3">
              <div className="flex flex-wrap gap-2">
                {row.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => setStatus(row.id, "published")}
                    className="rounded bg-green-700 px-2 py-1 text-xs text-white"
                  >
                    Publish
                  </button>
                )}
                {row.status !== "hidden" && (
                  <button
                    type="button"
                    onClick={() => setStatus(row.id, "hidden")}
                    className="rounded bg-slate-600 px-2 py-1 text-xs text-white"
                  >
                    Hide
                  </button>
                )}
                {row.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => setStatus(row.id, "archived")}
                    className="rounded bg-amber-700 px-2 py-1 text-xs text-white"
                  >
                    Archive
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
