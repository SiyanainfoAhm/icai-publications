/** Publications that offer the interactive flipbook demo reader. */
export const FLIPBOOK_SLUGS = new Set(["ca-journal-may-2026"]);

export function hasFlipbook(slug: string): boolean {
  return FLIPBOOK_SLUGS.has(slug);
}
