export const PUBLICATION_TYPES = [
  "pdf_publication",
  "web_page_article",
  "pdf_article",
] as const;

export type PublicationType = (typeof PUBLICATION_TYPES)[number];

export const DOWNLOAD_PERMISSIONS = [
  "disabled",
  "controlled_download",
  "admin_only",
] as const;

export type DownloadPermission = (typeof DOWNLOAD_PERMISSIONS)[number];

export const VISIBILITY_OPTIONS = ["public_metadata", "authenticated_reader"] as const;

export type PublicationVisibility = (typeof VISIBILITY_OPTIONS)[number];

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  pdf_publication: "PDF Publication",
  web_page_article: "Web Page / Article",
  pdf_article: "PDF + Article",
};

export const DOWNLOAD_PERMISSION_LABELS: Record<DownloadPermission, string> = {
  disabled: "Disabled",
  controlled_download: "Controlled Download",
  admin_only: "Admin Only",
};

export const VISIBILITY_LABELS: Record<PublicationVisibility, string> = {
  public_metadata: "Public Metadata Only",
  authenticated_reader: "Authenticated Reader Only",
};

export function publicationTypeNeedsPdf(type: PublicationType): boolean {
  return type === "pdf_publication" || type === "pdf_article";
}

export function publicationTypeNeedsArticle(type: PublicationType): boolean {
  return type === "web_page_article" || type === "pdf_article";
}

export function parseKeywords(raw: string): string {
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .join(", ");
}

/** Resolve article HTML from new or legacy column. */
export function resolveArticleContent(row: Record<string, unknown>): string {
  const article = (row.article_content as string) ?? "";
  if (article.trim()) return article;
  return ((row.content_html as string) ?? "").trim() || "<p></p>";
}

export interface PublicationFormFields {
  publication_type: PublicationType;
  title: string;
  slug: string;
  committee: string;
  topic: string;
  keywords: string;
  synopsis: string;
  release_date: string;
  article_content: string;
  status: string;
  is_featured: string;
  download_permission: DownloadPermission;
  visibility: PublicationVisibility;
}

export function validatePublicationForm(
  fields: PublicationFormFields,
  coverFile: File | null,
  pdfFile: File | null,
  hasCoverUrl = false,
  hasPdfUrl = false,
): string | null {
  if (!PUBLICATION_TYPES.includes(fields.publication_type)) {
    return "Please select a valid publication type.";
  }
  if (!fields.title.trim()) return "Title is required.";
  if (!fields.slug.trim()) return "Slug is required.";
  if (!fields.committee.trim()) return "Committee is required.";
  if (!fields.topic.trim()) return "Topic is required.";
  if (!fields.release_date.trim()) return "Release date is required.";
  if (!coverFile && !hasCoverUrl) return "Cover image is required.";

  const type = fields.publication_type;

  if (publicationTypeNeedsPdf(type) && !pdfFile && !hasPdfUrl) {
    return "PDF file is required for this publication type.";
  }

  if (type === "web_page_article" && !fields.article_content.trim()) {
    return "Article / Web Page Content is required for Web Page / Article publications.";
  }

  if (!fields.status.trim()) return "Status is required.";

  return null;
}
