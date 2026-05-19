import {
  parseKeywords,
  publicationTypeNeedsArticle,
  publicationTypeNeedsPdf,
  type PublicationFormFields,
} from "@/lib/publication-sow";
import type { DownloadPermission, PublicationStatus, PublicationVisibility } from "@/lib/types";

export function readFormString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readFormFile(form: FormData, key: string): File | null {
  const value = form.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export function parseFieldsFromForm(form: FormData): PublicationFormFields {
  return {
    publication_type: readFormString(form, "publication_type") as PublicationFormFields["publication_type"],
    title: readFormString(form, "title"),
    slug: readFormString(form, "slug"),
    committee: readFormString(form, "committee"),
    topic: readFormString(form, "topic"),
    keywords: readFormString(form, "keywords"),
    synopsis: readFormString(form, "synopsis"),
    release_date: readFormString(form, "release_date"),
    article_content: readFormString(form, "article_content"),
    status: readFormString(form, "status") || "draft",
    is_featured: readFormString(form, "is_featured") || "no",
    download_permission: (readFormString(form, "download_permission") ||
      "disabled") as DownloadPermission,
    visibility: (readFormString(form, "visibility") ||
      "authenticated_reader") as PublicationVisibility,
  };
}

export function buildPublicationRow(fields: PublicationFormFields, coverUrl: string | null) {
  let articleHtml = "";
  if (fields.publication_type === "web_page_article") {
    articleHtml = fields.article_content;
  } else if (fields.publication_type === "pdf_article") {
    articleHtml = fields.article_content || "";
  }

  return {
    publication_type: fields.publication_type,
    slug: fields.slug.toLowerCase(),
    title: fields.title,
    committee: fields.committee,
    topic: fields.topic,
    keywords: parseKeywords(fields.keywords) || null,
    cover_image_url: coverUrl,
    synopsis: fields.synopsis || null,
    release_date: fields.release_date,
    article_content: articleHtml,
    content_html: articleHtml,
    status: fields.status as PublicationStatus,
    is_featured: fields.is_featured === "yes",
    download_permission: fields.download_permission,
    visibility: fields.visibility,
    updated_at: new Date().toISOString(),
  };
}

export { publicationTypeNeedsArticle, publicationTypeNeedsPdf };
