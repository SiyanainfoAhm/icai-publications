/** Shared catalogue cover frame (matches SVG viewBox 400×520). */
export const CATALOGUE_COVER_ASPECT = "aspect-[400/520]";

/** Resolve cover path for catalogue display (handles legacy DB values). */
export function resolveCoverUrl(
  slug: string,
  coverImageUrl: string | null | undefined,
): string {
  const bySlug: Record<string, string> = {
    "ca-journal-may-2026": "/covers/ca-journal.png",
  };

  if (bySlug[slug]) return bySlug[slug];

  if (!coverImageUrl) return "/covers/default.svg";

  if (
    coverImageUrl.includes("ca-journal-may-2026.svg") ||
    coverImageUrl.endsWith("ca-journal-may-2026.svg")
  ) {
    return "/covers/ca-journal.png";
  }

  return coverImageUrl;
}

function isJournalCover(slug: string, src: string): boolean {
  return slug === "ca-journal-may-2026" || src.endsWith("ca-journal.png");
}

/** Same sizing for PNG and SVG — fit inside frame, anchor to top so titles are visible. */
export function catalogueCoverImageClasses(): string {
  return "absolute inset-0 h-full w-full object-contain object-top px-2 pt-3 pb-2";
}

export function catalogueCoverWrapperClasses(slug: string, src: string): string {
  const bg = isJournalCover(slug, src)
    ? "bg-[var(--icai-navy)]"
    : "bg-slate-100";
  return `relative h-full w-full overflow-hidden ${bg}`;
}
