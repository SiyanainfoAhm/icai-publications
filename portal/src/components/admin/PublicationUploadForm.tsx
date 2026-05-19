"use client";

import { type ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  publicationTypeNeedsArticle,
  publicationTypeNeedsPdf,
  validatePublicationForm,
  type PublicationFormFields,
  type PublicationType,
} from "@/lib/publication-sow";
import type { DownloadPermission, PublicationStatus, PublicationVisibility } from "@/lib/types";

const inputClass = "icai-field-input";
const labelClass = "icai-field-label";
const helpClass = "icai-field-help";

type LoadedPublication = {
  publication_type: PublicationType;
  title: string;
  slug: string;
  committee: string;
  topic: string;
  keywords: string | string[] | null;
  synopsis: string | null;
  release_date: string | null;
  article_content: string;
  status: PublicationStatus;
  is_featured: boolean;
  download_permission: DownloadPermission;
  visibility: PublicationVisibility;
  cover_image_url: string | null;
  pdf_file_url: string | null;
  file_url: string | null;
};

function formatKeywords(keywords: LoadedPublication["keywords"]): string {
  if (!keywords) return "";
  if (Array.isArray(keywords)) return keywords.join(", ");
  return keywords;
}

function formatReleaseDate(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function PublicationUploadForm({ publicationId }: { publicationId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(publicationId);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [publicationType, setPublicationType] = useState<PublicationType>("pdf_publication");
  const [initial, setInitial] = useState<LoadedPublication | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [formKey, setFormKey] = useState("new");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);

  const showPdf = publicationTypeNeedsPdf(publicationType);
  const showArticle = publicationTypeNeedsArticle(publicationType);
  const coverDisplay = coverPreview || existingCoverUrl;

  useEffect(() => {
    if (!publicationId) return;

    let cancelled = false;
    setLoadingInitial(true);
    fetch(`/api/admin/publications/${publicationId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error || !d.publication) {
          setError(d.error ?? "Could not load publication");
          return;
        }
        const pub = d.publication as LoadedPublication;
        setInitial(pub);
        setPublicationType(pub.publication_type ?? "pdf_publication");
        setExistingCoverUrl(pub.cover_image_url);
        setExistingPdfUrl(pub.pdf_file_url ?? pub.file_url);
        setFormKey(publicationId);
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });

    return () => {
      cancelled = true;
    };
  }, [publicationId]);

  function onCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
    setCoverFileName(file?.name ?? null);
  }

  function onPdfChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPdfFile(file);
    setPdfFileName(file?.name ?? null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const fields: PublicationFormFields = {
      publication_type: publicationType,
      title: String(formData.get("title") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      committee: String(formData.get("committee") ?? "").trim(),
      topic: String(formData.get("topic") ?? "").trim(),
      keywords: String(formData.get("keywords") ?? "").trim(),
      synopsis: String(formData.get("synopsis") ?? "").trim(),
      release_date: String(formData.get("release_date") ?? "").trim(),
      article_content: String(formData.get("article_content") ?? "").trim(),
      status: String(formData.get("status") ?? "").trim(),
      is_featured: String(formData.get("is_featured") ?? "no"),
      download_permission: String(formData.get("download_permission") ?? "disabled") as PublicationFormFields["download_permission"],
      visibility: String(formData.get("visibility") ?? "authenticated_reader") as PublicationFormFields["visibility"],
    };

    const clientError = validatePublicationForm(
      fields,
      coverFile,
      pdfFile,
      Boolean(existingCoverUrl),
      Boolean(existingPdfUrl),
    );
    if (clientError) {
      setError(clientError);
      return;
    }

    formData.set("publication_type", publicationType);
    if (coverFile) formData.set("cover_image", coverFile);
    if (pdfFile) formData.set("pdf_file", pdfFile);

    setLoading(true);
    const url = isEdit
      ? `/api/admin/publications/${publicationId}`
      : "/api/admin/publications";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save publication");
      return;
    }
    router.push("/admin/publications");
  }

  if (loadingInitial) {
    return <p className="mt-6 text-sm text-slate-500">Loading publication…</p>;
  }

  if (isEdit && !initial && error) {
    return (
      <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  const featuredDefault = initial?.is_featured ? "yes" : "no";

  return (
    <form
      key={formKey}
      onSubmit={onSubmit}
      className="icai-admin-form w-full max-w-3xl"
      encType="multipart/form-data"
    >
      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="icai-form-section" aria-labelledby="pub-type-heading">
        <h2 id="pub-type-heading" className="icai-form-section-title">
          Publication type
        </h2>
        <label className={labelClass}>
          Publication Type
          <select
            name="publication_type"
            value={publicationType}
            onChange={(e) => setPublicationType(e.target.value as PublicationType)}
            className={inputClass}
            required
          >
            <option value="pdf_publication">PDF Publication</option>
            <option value="web_page_article">Web Page / Article</option>
            <option value="pdf_article">PDF + Article</option>
          </select>
        </label>
      </section>

      {showPdf && (
        <section className="icai-form-section" aria-labelledby="pub-pdf-heading">
          <h2 id="pub-pdf-heading" className="icai-form-section-title">
            PDF document
          </h2>
          <div>
            <span className={labelClass}>PDF File</span>
            <input
              ref={pdfInputRef}
              name="pdf_file"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={onPdfChange}
            />
            <p className={helpClass}>
              {isEdit && existingPdfUrl
                ? "Upload a new PDF to replace the current file, or leave empty to keep the existing PDF."
                : "Required for PDF Publication and PDF + Article. Stored securely and accessible only through authorized session-based access."}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="icai-file-btn"
              >
                {pdfFileName ? "Change PDF file" : isEdit && existingPdfUrl ? "Replace PDF file" : "Choose PDF file"}
              </button>
              {pdfFileName && (
                <span className="max-w-md truncate text-xs text-slate-600">{pdfFileName}</span>
              )}
              {!pdfFileName && isEdit && existingPdfUrl && (
                <span className="text-xs text-slate-600">Current PDF on file</span>
              )}
            </div>
          </div>
        </section>
      )}

      {showArticle && (
        <section className="icai-form-section" aria-labelledby="pub-article-heading">
          <h2 id="pub-article-heading" className="icai-form-section-title">
            Article content
          </h2>
          <label className={labelClass}>
            Article / Web Page Content
            <textarea
              name="article_content"
              rows={10}
              required={publicationType === "web_page_article"}
              className={`${inputClass} font-mono text-sm`}
              placeholder="<article class='icai-reader-content'>…</article>"
              defaultValue={initial?.article_content ?? ""}
            />
            <span className={helpClass}>
              Optional — use this only when the publication type is Web Page / Article or
              PDF + Article.
            </span>
          </label>
        </section>
      )}

      <section className="icai-form-section" aria-labelledby="pub-meta-heading">
        <h2 id="pub-meta-heading" className="icai-form-section-title">
          Catalogue metadata
        </h2>
        <div className="icai-form-grid icai-form-grid--two-col">
          <label className={labelClass}>
            Title
            <input name="title" required className={inputClass} defaultValue={initial?.title ?? ""} />
          </label>
          <label className={labelClass}>
            Slug
            <input
              name="slug"
              required
              className={inputClass}
              placeholder="e.g. gst-compendium-q1-2026"
              defaultValue={initial?.slug ?? ""}
            />
          </label>
          <label className={labelClass}>
            Committee
            <input name="committee" required className={inputClass} defaultValue={initial?.committee ?? ""} />
          </label>
          <label className={labelClass}>
            Topic
            <input name="topic" required className={inputClass} defaultValue={initial?.topic ?? ""} />
          </label>
          <label className={`${labelClass} icai-form-grid-span-full`}>
            Keywords / Tags
            <input
              name="keywords"
              className={inputClass}
              placeholder="Audit, Taxation, Ethics, Financial Reporting"
              defaultValue={initial ? formatKeywords(initial.keywords) : ""}
            />
          </label>
        </div>
      </section>

      <section className="icai-form-section" aria-labelledby="pub-cover-heading">
        <h2 id="pub-cover-heading" className="icai-form-section-title">
          Cover &amp; summary
        </h2>
        <div className="mb-4">
          <span className={labelClass}>Cover image</span>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onCoverChange}
          />
          <p className={helpClass}>
            {isEdit && existingCoverUrl
              ? "Upload a new image to replace the current cover, or leave empty to keep it."
              : "JPEG, PNG, WebP, or GIF. Shown in the catalogue."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="icai-file-btn"
            >
              {coverFileName
                ? "Change cover image"
                : isEdit && existingCoverUrl
                  ? "Replace cover image"
                  : "Choose cover image"}
            </button>
            {coverFileName && (
              <span className="max-w-xs truncate text-xs text-slate-600">{coverFileName}</span>
            )}
          </div>
          {coverDisplay && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverDisplay}
              alt="Cover preview"
              className="mt-3 max-h-52 rounded-lg border border-slate-200 object-contain shadow-sm"
            />
          )}
        </div>
        <label className={labelClass}>
          Release date
          <input
            name="release_date"
            type="date"
            required
            className={inputClass}
            defaultValue={formatReleaseDate(initial?.release_date ?? null)}
          />
        </label>
        <label className={labelClass}>
          Synopsis
          <textarea
            name="synopsis"
            rows={3}
            className={inputClass}
            defaultValue={initial?.synopsis ?? ""}
          />
        </label>
      </section>

      <section className="icai-form-section" aria-labelledby="pub-dist-heading">
        <h2 id="pub-dist-heading" className="icai-form-section-title">
          Distribution &amp; access
        </h2>
        <div className="icai-form-grid icai-form-grid--two-col">
          <label className={labelClass}>
            Featured Publication
            <select name="is_featured" defaultValue={featuredDefault} className={inputClass}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className={labelClass}>
            Download Permission
            <select
              name="download_permission"
              defaultValue={initial?.download_permission ?? "disabled"}
              className={inputClass}
            >
              <option value="disabled">Disabled</option>
              <option value="controlled_download">Controlled Download</option>
              <option value="admin_only">Admin Only</option>
            </select>
          </label>
          <label className={`${labelClass} icai-form-grid-span-full`}>
            Visibility
            <select
              name="visibility"
              defaultValue={initial?.visibility ?? "authenticated_reader"}
              className={inputClass}
            >
              <option value="public_metadata">Public Metadata Only</option>
              <option value="authenticated_reader">Authenticated Reader Only</option>
            </select>
          </label>
        </div>
      </section>

      <section className="icai-form-section" aria-labelledby="pub-status-heading">
        <h2 id="pub-status-heading" className="icai-form-section-title">
          Publishing
        </h2>
        <label className={labelClass}>
          Status
          <select
            name="status"
            defaultValue={initial?.status ?? "draft"}
            required
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </select>
          <span className={helpClass}>
            Hidden publications will not be visible publicly and should not be accessible
            through public URLs.
          </span>
        </label>
      </section>

      <div className="admin-form-actions flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="icai-btn-primary rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading
            ? isEdit
              ? "Updating publication…"
              : "Saving publication…"
            : isEdit
              ? "Update publication"
              : "Save publication"}
        </button>
        <p className="text-xs text-slate-500">
          Required fields are validated before upload. PDF and cover files are stored in
          secure storage.
        </p>
      </div>
    </form>
  );
}
