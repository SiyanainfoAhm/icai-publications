import Link from "next/link";
import { CatalogueCardActions } from "@/components/CatalogueCardActions";
import { CoverImage } from "@/components/CoverImage";
import { CATALOGUE_COVER_ASPECT } from "@/lib/covers";
import type { PublicationMeta } from "@/lib/types";

export function PublicationCard({ publication }: { publication: PublicationMeta }) {
  const date = publication.release_date
    ? new Date(publication.release_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <article className="icai-card flex h-full flex-col overflow-hidden rounded-lg transition hover:shadow-md">
      <section
        className={`relative w-full shrink-0 ${CATALOGUE_COVER_ASPECT}`}
        aria-hidden
      >
        <CoverImage
          slug={publication.slug}
          coverImageUrl={publication.cover_image_url}
          alt={publication.title}
          variant="catalogue"
        />
      </section>
      <section className="flex flex-1 flex-col p-5">
        {publication.topic && (
          <span className="icai-badge mb-2 inline-block w-fit rounded px-2 py-0.5">
            {publication.topic}
          </span>
        )}
        <h2 className="text-lg font-semibold text-[var(--icai-navy)]">
          <Link href={`/publications/${publication.slug}`} className="hover:underline">
            {publication.title}
          </Link>
        </h2>
        {publication.committee && (
          <p className="mt-1 text-sm text-slate-600">{publication.committee}</p>
        )}
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-700">
          {publication.synopsis}
        </p>
        <p className="mt-4 text-xs font-medium text-slate-500">Released {date}</p>
        <Link
          href={`/publications/${publication.slug}`}
          className="mt-4 text-sm font-semibold text-[var(--icai-navy)] hover:text-[var(--icai-gold)]"
        >
          View details →
        </Link>
        <CatalogueCardActions slug={publication.slug} />
      </section>
    </article>
  );
}
