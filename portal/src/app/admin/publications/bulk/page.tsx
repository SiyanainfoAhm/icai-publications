"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { parseCsv, publicationImportTemplateCsv } from "@/lib/admin/csv";

const MAX_ROWS = 5;

const PREVIEW_COL_CLASS: Record<string, string> = {
  title: "col-import-title",
  slug: "col-import-slug",
  committee: "col-import-committee",
  topic: "col-import-topic",
};

function downloadTemplate() {
  const blob = new Blob([publicationImportTemplateCsv()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "publication-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(2);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importRows, setImportRows] = useState<Record<string, string>[]>([]);

  function applyImportToForm(rows: Record<string, string>[]) {
    const n = Math.min(Math.max(rows.length, 1), MAX_ROWS);
    setCount(n);
    window.setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      rows.slice(0, MAX_ROWS).forEach((row, i) => {
        for (const [key, value] of Object.entries(row)) {
          const el = form.elements.namedItem(`row_${i}_${key}`) as
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement
            | null;
          if (el) el.value = value;
        }
      });
      toast(`Loaded ${Math.min(rows.length, MAX_ROWS)} row(s) into the form.`, "success");
    }, 0);
  }

  async function onCsvSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();
    const matrix = parseCsv(text.replace(/^\uFEFF/, ""));
    if (matrix.length < 2) {
      toast("CSV must include a header row and at least one data row.", "error");
      return;
    }

    const headers = matrix[0].map((h) => h.trim().toLowerCase());
    const rows = matrix.slice(1).map((cells) => {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        if (h) row[h] = (cells[i] ?? "").trim();
      });
      return row;
    }).filter((r) => r.title || r.slug);

    if (rows.length === 0) {
      toast("No data rows found in the CSV.", "error");
      return;
    }

    setImportHeaders(headers.filter(Boolean));
    setImportRows(rows);
    applyImportToForm(rows);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    let ok = 0;
    let fail = 0;

    for (let i = 0; i < count; i++) {
      const fd = new FormData();
      const prefix = `row_${i}_`;
      const get = (name: string) => {
        const el = form.elements.namedItem(`${prefix}${name}`) as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          | null;
        return el?.value ?? "";
      };
      const cover = form.elements.namedItem(`${prefix}cover_image`) as HTMLInputElement;
      const pdf = form.elements.namedItem(`${prefix}pdf_file`) as HTMLInputElement;

      fd.set("publication_type", get("publication_type"));
      fd.set("title", get("title"));
      fd.set("slug", get("slug"));
      fd.set("committee", get("committee"));
      fd.set("topic", get("topic"));
      fd.set("keywords", get("keywords"));
      fd.set("release_date", get("release_date"));
      fd.set("synopsis", get("synopsis"));
      fd.set("article_content", get("article_content"));
      fd.set("status", get("status") || "draft");
      fd.set("is_featured", "no");
      fd.set("download_permission", "disabled");
      fd.set("visibility", "authenticated_reader");
      if (cover?.files?.[0]) fd.set("cover_image", cover.files[0]);
      if (pdf?.files?.[0]) fd.set("pdf_file", pdf.files[0]);

      if (!get("title") || !get("slug")) continue;

      const res = await fetch("/api/admin/publications", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (res.ok) ok++;
      else fail++;
    }

    setLoading(false);
    toast(`Bulk upload: ${ok} saved, ${fail} failed.`, ok ? "success" : "error");
    if (ok > 0) router.push("/admin/publications");
  }

  const previewColumns =
    importHeaders.length > 0
      ? importHeaders
      : ["publication_type", "title", "slug", "committee", "topic", "release_date", "status"];

  return (
    <>
      <h1 className="admin-page-title">Bulk upload</h1>
      <p className="admin-page-subtitle">
        Import from CSV (metadata) or enter up to {MAX_ROWS} publications manually. Cover
        images and PDFs are still attached per row below.
      </p>

      <section className="admin-form-intro">
        <h2 className="text-sm font-semibold text-[var(--icai-navy)]">Import from CSV</h2>
        <p className="mt-1 text-xs text-slate-600">
          Download the template, fill rows in Excel, then import. Preview shows column widths
          before you attach files and upload.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={downloadTemplate} className="icai-file-btn">
            Download template
          </button>
          <label className="icai-file-btn cursor-pointer">
            Choose CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={onCsvSelected}
            />
          </label>
        </div>

        {importRows.length > 0 ? (
          <div className="admin-import-table-wrap">
            <table className="admin-import-table">
              <thead>
                <tr>
                  {previewColumns.map((h) => (
                    <th key={h} className={PREVIEW_COL_CLASS[h] ?? ""}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importRows.slice(0, MAX_ROWS).map((row, i) => (
                  <tr key={i}>
                    {previewColumns.map((h) => (
                      <td key={h} className={PREVIEW_COL_CLASS[h] ?? ""} title={row[h] ?? ""}>
                        {row[h] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <form ref={formRef} onSubmit={onSubmit} className="icai-admin-form">
        <div className="admin-form-intro">
          <label className="icai-field-label">
            Number of publications
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="icai-field-input max-w-[8rem]"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {Array.from({ length: count }, (_, i) => (
          <section key={i} className="icai-form-section">
            <h2 className="icai-form-section-title">Publication {i + 1}</h2>
            <div className="icai-form-grid icai-form-grid--two-col icai-form-grid--bulk">
              <label className="icai-field-label">
                Type
                <select
                  name={`row_${i}_publication_type`}
                  defaultValue="pdf_publication"
                  className="icai-field-input"
                >
                  <option value="pdf_publication">PDF Publication</option>
                  <option value="web_page_article">Web Page / Article</option>
                  <option value="pdf_article">PDF + Article</option>
                </select>
              </label>
              <label className="icai-field-label">
                Status
                <select name={`row_${i}_status`} defaultValue="draft" className="icai-field-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="icai-field-label">
                Title
                <input name={`row_${i}_title`} className="icai-field-input" required />
              </label>
              <label className="icai-field-label">
                Slug
                <input name={`row_${i}_slug`} className="icai-field-input" required />
              </label>
              <label className="icai-field-label">
                Committee
                <input name={`row_${i}_committee`} className="icai-field-input" required />
              </label>
              <label className="icai-field-label">
                Topic
                <input name={`row_${i}_topic`} className="icai-field-input" required />
              </label>
              <label className="icai-field-label icai-form-grid-span-full">
                Keywords
                <input name={`row_${i}_keywords`} className="icai-field-input" />
              </label>
              <label className="icai-field-label">
                Release date
                <input
                  name={`row_${i}_release_date`}
                  type="date"
                  required
                  className="icai-field-input"
                />
              </label>
              <label className="icai-field-label">
                Cover image
                <input
                  name={`row_${i}_cover_image`}
                  type="file"
                  accept="image/*"
                  required
                  className="icai-field-file"
                />
              </label>
              <label className="icai-field-label">
                PDF file
                <input name={`row_${i}_pdf_file`} type="file" accept=".pdf" className="icai-field-file" />
              </label>
              <label className="icai-field-label icai-form-grid-span-full">
                Synopsis
                <textarea name={`row_${i}_synopsis`} rows={2} className="icai-field-input" />
              </label>
              <label className="icai-field-label icai-form-grid-span-full">
                Article content
                <textarea
                  name={`row_${i}_article_content`}
                  rows={3}
                  className="icai-field-input font-mono text-xs"
                />
              </label>
            </div>
          </section>
        ))}

        <div className="admin-form-actions">
          <button
            type="submit"
            disabled={loading}
            className="icai-btn-primary rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Uploading…" : "Upload batch"}
          </button>
        </div>
      </form>
    </>
  );
}
