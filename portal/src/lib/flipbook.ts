import type { PublicationType } from "@/lib/types";

/** Publications with rich demo flipbook page content in flipbook-content.ts */
export const FLIPBOOK_SLUGS = new Set([
  "ca-journal-may-2026",
  "handbook-audit-2026",
  "gst-compendium-q1-2026",
]);

export type FlipbookEligible = {
  slug: string;
  publication_type?: PublicationType | string | null;
};

export function publicationSupportsFlipbook(pub: FlipbookEligible): boolean {
  if (FLIPBOOK_SLUGS.has(pub.slug)) return true;
  const type = pub.publication_type ?? "pdf_article";
  return type === "pdf_publication" || type === "pdf_article";
}

/** @deprecated Prefer publicationSupportsFlipbook when publication_type is known */
export function hasFlipbook(slug: string): boolean {
  return FLIPBOOK_SLUGS.has(slug);
}
