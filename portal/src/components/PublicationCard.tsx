import Link from "next/link";
import { CatalogueCardActions } from "@/components/CatalogueCardActions";
import { CoverImage } from "@/components/CoverImage";
import { CATALOGUE_COVER_ASPECT } from "@/lib/covers";
import { formatPublicationStatus, formatPublicationType } from "@/lib/format";
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
        {publication.is_featured && (
          <span className="icai-badge icai-badge-featured absolute left-2 top-2 rounded px-2 py-0.5 shadow-sm">
            Featured
          </span>
        )}
      </section>
      <section className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="icai-badge icai-badge-type rounded px-2 py-0.5">
            {formatPublicationType(publication.publication_type)}
          </span>
          {publication.committee && (
            <span className="icai-badge icai-badge-committee rounded px-2 py-0.5">
              {publication.committee}
            </span>
          )}
          <span
            className={`icai-badge icai-badge-status icai-badge-status--${publication.status} rounded px-2 py-0.5`}
          >
            {formatPublicationStatus(publication.status)}
          </span>
        </div>
        {publication.topic && (
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {publication.topic}
          </p>
        )}
        <h2 className="mt-1 text-lg font-semibold text-[var(--icai-navy)]">
          <Link href={`/publications/${publication.slug}`} className="hover:underline">
            {publication.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-700">
          {publication.synopsis}
        </p>
        <p className="mt-4 text-xs font-medium text-slate-500">Released {date}</p>
        <CatalogueCardActions publication={publication} />
      </section>
    </article>
  );
}
