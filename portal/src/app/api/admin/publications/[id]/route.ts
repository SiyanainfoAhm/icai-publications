import { NextRequest, NextResponse } from "next/server";
import {
  buildPublicationRow,
  parseFieldsFromForm,
  publicationTypeNeedsPdf,
  readFormFile,
} from "@/lib/admin/publication-form";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { resolveArticleContent, validatePublicationForm } from "@/lib/publication-sow";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  uploadPublicationCover,
  validateCoverFile,
} from "@/lib/storage/publication-cover";
import { uploadPublicationPdf, validatePdfFile } from "@/lib/storage/publication-pdf";
import type { PublicationStatus } from "@/lib/types";

const ALLOWED: PublicationStatus[] = ["draft", "published", "hidden", "archived"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.status && ALLOWED.includes(body.status)) updates.status = body.status;
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.synopsis === "string") updates.synopsis = body.synopsis;
  if (typeof body.committee === "string") updates.committee = body.committee;
  if (typeof body.topic === "string") updates.topic = body.topic;
  if (typeof body.keywords === "string") updates.keywords = body.keywords;
  if (typeof body.release_date === "string") updates.release_date = body.release_date || null;
  if (typeof body.article_content === "string") {
    updates.article_content = body.article_content;
    updates.content_html = body.article_content;
  }
  if (typeof body.content_html === "string") {
    updates.content_html = body.content_html;
    updates.article_content = body.content_html;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("icai_publications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ publication: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("icai_publications").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Publication update requires multipart form data." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: existing, error: fetchError } = await supabase
    .from("icai_publications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Publication not found" }, { status: 404 });
  }

  const form = await request.formData();
  const fields = parseFieldsFromForm(form);
  const coverFile = readFormFile(form, "cover_image");
  const pdfFile = readFormFile(form, "pdf_file");

  const hasCoverUrl = Boolean(existing.cover_image_url);
  const hasPdfUrl = Boolean(existing.pdf_file_url || existing.file_url);

  const validationError = validatePublicationForm(
    fields,
    coverFile,
    pdfFile,
    hasCoverUrl,
    hasPdfUrl,
  );
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

  let coverUrl = (existing.cover_image_url as string | null) ?? null;
  const updateRow = buildPublicationRow(fields, coverUrl);

  const { data, error } = await supabase
    .from("icai_publications")
    .update(updateRow)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let publication = data;

  try {
    if (coverFile) {
      const { publicUrl } = await uploadPublicationCover(supabase, id, coverFile);
      const { data: updated, error: coverErr } = await supabase
        .from("icai_publications")
        .update({ cover_image_url: publicUrl })
        .eq("id", id)
        .select()
        .single();
      if (coverErr) throw new Error(coverErr.message);
      publication = updated;
    }

    if (pdfFile && publicationTypeNeedsPdf(fields.publication_type)) {
      const { publicUrl } = await uploadPublicationPdf(supabase, id, pdfFile);
      const { data: updated, error: pdfErr } = await supabase
        .from("icai_publications")
        .update({ pdf_file_url: publicUrl, file_url: publicUrl })
        .eq("id", id)
        .select()
        .single();
      if (pdfErr) throw new Error(pdfErr.message);
      publication = updated;
    }

    return NextResponse.json({
      publication: {
        ...publication,
        article_content: resolveArticleContent(publication),
      },
    });
  } catch (uploadError) {
    const message =
      uploadError instanceof Error ? uploadError.message : "File upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("icai_publications").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Publication not found" }, { status: 404 });
  }

  return NextResponse.json({
    publication: {
      ...data,
      article_content: resolveArticleContent(data),
    },
  });
}
