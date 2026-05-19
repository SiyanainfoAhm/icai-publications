import { resolveCoverUrl } from "@/lib/covers";
import type {
  DownloadPermission,
  PublicationMeta,
  PublicationStatus,
  PublicationType,
  PublicationVisibility,
} from "@/lib/types";

export const PUBLIC_META_FIELDS =
  "id, slug, title, publication_type, committee, topic, keywords, cover_image_url, synopsis, release_date, status, is_featured, download_permission, visibility";

export function isPubliclyListed(status: PublicationStatus): boolean {
  return status === "published";
}

export function toPublicationMeta(row: Record<string, unknown>): PublicationMeta {
  const slug = row.slug as string;
  return {
    id: row.id as string,
    slug,
    title: row.title as string,
    publication_type: (row.publication_type as PublicationType) ?? "pdf_article",
    committee: (row.committee as string) ?? null,
    topic: (row.topic as string) ?? null,
    keywords: (row.keywords as string) ?? null,
    cover_image_url: resolveCoverUrl(slug, (row.cover_image_url as string) ?? null),
    synopsis: (row.synopsis as string) ?? null,
    release_date: (row.release_date as string) ?? null,
    status: row.status as PublicationStatus,
    is_featured: Boolean(row.is_featured),
    download_permission: (row.download_permission as DownloadPermission) ?? "disabled",
    visibility: (row.visibility as PublicationVisibility) ?? "authenticated_reader",
  };
}
