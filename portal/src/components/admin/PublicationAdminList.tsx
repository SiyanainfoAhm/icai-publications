"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminActionButton } from "@/components/ui/AdminActionButton";
import { AdminConfirmDialog } from "@/components/ui/AdminConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { publicationTypeNeedsPdf } from "@/lib/publication-sow";
import { formatPublicationStatus, formatPublicationType } from "@/lib/format";
import { PUBLICATION_TYPE_LABELS } from "@/lib/publication-sow";
import type { PublicationStatus, PublicationType } from "@/lib/types";

interface Row {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  publication_type: PublicationType;
  release_date: string | null;
  committee: string | null;
  pdf_file_url?: string | null;
}

const STATUS_ACTION_LABEL: Record<PublicationStatus, string> = {
  published: "published",
  hidden: "hidden",
  archived: "archived",
  draft: "saved as draft",
};

export function PublicationAdminList() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [noPdfTarget, setNoPdfTarget] = useState<Row | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/admin/publications?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setRows(d.publications ?? []);
      })
      .finally(() => setLoading(false));
  }, [q, type, dateFrom, dateTo]);

  useEffect(() => {
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  async function setStatus(row: Row, status: PublicationStatus) {
    const key = `${row.id}:${status}`;
    if (pendingKey) return;
    setPendingKey(key);
    const previousStatus = row.status;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));

    const res = await fetch(`/api/admin/publications/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPendingKey(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: previousStatus } : r)),
      );
      toast(data.error ?? "Could not update status", "error");
      return;
    }
    setPulseId(row.id);
    window.setTimeout(() => setPulseId(null), 650);
    toast(`“${row.title}” ${STATUS_ACTION_LABEL[status]}.`, "success");
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/publications/${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setDeleteLoading(false);
    if (!res.ok) {
      toast("Could not delete publication", "error");
      return;
    }
    toast(`“${deleteTarget.title}” deleted.`, "success");
    setDeleteTarget(null);
    load();
  }

  async function copyPdfUrl(row: Row) {
    if (!row.pdf_file_url?.trim()) {
      setNoPdfTarget(row);
      return;
    }
    const res = await fetch(`/api/admin/publications/${row.id}/pdf-url`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error ?? "No PDF URL available", "error");
      return;
    }
    await navigator.clipboard.writeText(data.authorizedUrl);
    toast("Authorized PDF URL copied to clipboard.", "success");
  }

  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <>
      <div className="admin-toolbar">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Search title</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, slug, committee…"
            className="icai-field-input w-48"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="icai-field-input w-44"
          >
            <option value="">All types</option>
            {Object.entries(PUBLICATION_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Release from</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="icai-field-input"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Release to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="icai-field-input"
          />
        </label>
        <Link href="/admin/publications/new" className="icai-btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
          + New publication
        </Link>
      </div>

      {loading && rows.length === 0 ? (
        <p className="text-sm text-slate-500">Loading publications…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No publications match your filters.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-title">Title</th>
                <th className="col-type">Type</th>
                <th className="col-date">Release</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="col-title font-medium text-[var(--icai-navy)]">
                    {row.title}
                    <p className="text-xs font-normal text-slate-500">{row.slug}</p>
                  </td>
                  <td className="col-type">{formatPublicationType(row.publication_type ?? "pdf_article")}</td>
                  <td className="col-date">{row.release_date ?? "—"}</td>
                  <td className={`col-status ${pulseId === row.id ? "icai-status-pulse" : ""}`}>
                    {formatPublicationStatus(row.status)}
                  </td>
                  <td className="col-actions">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/publications/${row.id}/edit`}
                        className="icai-file-btn text-xs"
                      >
                        Edit
                      </Link>
                      {row.status !== "published" && (
                        <AdminActionButton
                          variant="publish"
                          loading={pendingKey === `${row.id}:published`}
                          disabled={!!pendingKey}
                          onClick={() => setStatus(row, "published")}
                        >
                          Publish
                        </AdminActionButton>
                      )}
                      {row.status !== "hidden" && (
                        <AdminActionButton
                          variant="hide"
                          loading={pendingKey === `${row.id}:hidden`}
                          disabled={!!pendingKey}
                          onClick={() => setStatus(row, "hidden")}
                        >
                          Hide
                        </AdminActionButton>
                      )}
                      {row.status !== "archived" && (
                        <AdminActionButton
                          variant="archive"
                          loading={pendingKey === `${row.id}:archived`}
                          disabled={!!pendingKey}
                          onClick={() => setStatus(row, "archived")}
                        >
                          Archive
                        </AdminActionButton>
                      )}
                      {publicationTypeNeedsPdf(row.publication_type) && (
                        <button
                          type="button"
                          onClick={() => copyPdfUrl(row)}
                          className="icai-file-btn text-xs"
                        >
                          PDF URL
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Delete publication?"
        message={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
      />

      <AdminConfirmDialog
        open={!!noPdfTarget}
        title="No PDF available"
        message={
          noPdfTarget
            ? `“${noPdfTarget.title}” does not have an uploaded PDF yet. Edit the publication and upload a PDF file, then try again.`
            : ""
        }
        confirmLabel="OK"
        cancelLabel="Close"
        variant="default"
        onConfirm={() => setNoPdfTarget(null)}
        onCancel={() => setNoPdfTarget(null)}
      />
    </>
  );
}
