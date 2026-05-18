import { resolveCoverUrl } from "@/lib/covers";
import type { PublicationMeta, PublicationStatus } from "@/lib/types";

export const PUBLIC_META_FIELDS =
  "id, slug, title, committee, topic, cover_image_url, synopsis, release_date, status";

export function isPubliclyListed(status: PublicationStatus): boolean {
  return status === "published";
}

export function toPublicationMeta(row: Record<string, unknown>): PublicationMeta {
  const slug = row.slug as string;
  return {
    id: row.id as string,
    slug,
    title: row.title as string,
    committee: (row.committee as string) ?? null,
    topic: (row.topic as string) ?? null,
    cover_image_url: resolveCoverUrl(slug, (row.cover_image_url as string) ?? null),
    synopsis: (row.synopsis as string) ?? null,
    release_date: (row.release_date as string) ?? null,
    status: row.status as PublicationStatus,
  };
}
