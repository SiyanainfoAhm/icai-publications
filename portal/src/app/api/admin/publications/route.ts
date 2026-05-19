import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getTokenFromRequest, resolveSessionUser } from "@/lib/auth/session";
import {
  parseKeywords,
  publicationTypeNeedsArticle,
  publicationTypeNeedsPdf,
  resolveArticleContent,
  validatePublicationForm,
  type PublicationFormFields,
  type PublicationType,
} from "@/lib/publication-sow";
import { PUBLIC_META_FIELDS } from "@/lib/publications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  uploadPublicationCover,
  validateCoverFile,
} from "@/lib/storage/publication-cover";
import { uploadPublicationPdf, validatePdfFile } from "@/lib/storage/publication-pdf";
import type { DownloadPermission, PublicationStatus, PublicationVisibility } from "@/lib/types";

function readFormString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readFormFile(form: FormData, key: string): File | null {
  const value = form.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function parseFieldsFromForm(form: FormData): PublicationFormFields {
  return {
    publication_type: readFormString(form, "publication_type") as PublicationType,
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

function buildInsertRow(
  fields: PublicationFormFields,
  userId: string,
  coverUrl: string | null,
) {
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
    created_by: userId,
  };
}

export async function GET(request: NextRequest) {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;

  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  const type = request.nextUrl.searchParams.get("type") ?? "";
  const dateFrom = request.nextUrl.searchParams.get("dateFrom") ?? "";
  const dateTo = request.nextUrl.searchParams.get("dateTo") ?? "";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_publications")
    .select(`${PUBLIC_META_FIELDS}, pdf_file_url, created_at, updated_at`)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let publications = data ?? [];
  if (q) {
    publications = publications.filter(
      (p) =>
        (p.title as string)?.toLowerCase().includes(q) ||
        (p.slug as string)?.toLowerCase().includes(q) ||
        (p.committee as string)?.toLowerCase().includes(q),
    );
  }
  if (type) {
    publications = publications.filter((p) => p.publication_type === type);
  }
  if (dateFrom) {
    publications = publications.filter(
      (p) => p.release_date && (p.release_date as string) >= dateFrom,
    );
  }
  if (dateTo) {
    publications = publications.filter(
      (p) => p.release_date && (p.release_date as string) <= dateTo,
    );
  }

  return NextResponse.json({ publications });
}

export async function POST(request: NextRequest) {
  const user = await resolveSessionUser(getTokenFromRequest(request));
  const denied = requireAdmin(user);
  if (denied) return denied;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Publication upload requires multipart form data." },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const fields = parseFieldsFromForm(form);
  const coverFile = readFormFile(form, "cover_image");
  const pdfFile = readFormFile(form, "pdf_file");

  const validationError = validatePublicationForm(fields, coverFile, pdfFile);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (coverFile) {
    const coverFileError = validateCoverFile(coverFile);
    if (coverFileError) {
      return NextResponse.json({ error: coverFileError }, { status: 400 });
    }
  }

  if (pdfFile && publicationTypeNeedsPdf(fields.publication_type)) {
    const pdfFileError = validatePdfFile(pdfFile);
    if (pdfFileError) {
      return NextResponse.json({ error: pdfFileError }, { status: 400 });
    }
  }

  const supabase = getSupabaseAdmin();
  const insertRow = buildInsertRow(fields, user!.id, null);

  const { data, error } = await supabase
    .from("icai_publications")
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let publication = data;

  try {
    if (coverFile) {
      const { publicUrl } = await uploadPublicationCover(supabase, data.id, coverFile);
      const { data: updated, error: coverErr } = await supabase
        .from("icai_publications")
        .update({ cover_image_url: publicUrl })
        .eq("id", data.id)
        .select()
        .single();
      if (coverErr) throw new Error(coverErr.message);
      publication = updated;
    }

    if (pdfFile && publicationTypeNeedsPdf(fields.publication_type)) {
      const { publicUrl } = await uploadPublicationPdf(supabase, data.id, pdfFile);
      const { data: updated, error: pdfErr } = await supabase
        .from("icai_publications")
        .update({ pdf_file_url: publicUrl, file_url: publicUrl })
        .eq("id", data.id)
        .select()
        .single();
      if (pdfErr) throw new Error(pdfErr.message);
      publication = updated;
    }

    return NextResponse.json(
      {
        publication: {
          ...publication,
          article_content: resolveArticleContent(publication),
        },
      },
      { status: 201 },
    );
  } catch (uploadError) {
    await supabase.from("icai_publications").delete().eq("id", data.id);
    const message =
      uploadError instanceof Error ? uploadError.message : "File upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
