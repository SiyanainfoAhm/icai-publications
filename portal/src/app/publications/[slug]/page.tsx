import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/CoverImage";
import { PublicationReadActions } from "@/components/PublicationReadActions";
import { CATALOGUE_COVER_ASPECT } from "@/lib/covers";
import { fetchPublicationBySlug } from "@/lib/data/publications";
import { publicationSupportsFlipbook } from "@/lib/flipbook";

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publication = await fetchPublicationBySlug(slug);
  if (!publication) notFound();

  const date = publication.release_date
    ? new Date(publication.release_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm text-[var(--icai-navy)] hover:underline">
        ← Back to catalogue
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <figure className={`relative mx-auto w-full max-w-[220px] md:mx-0 ${CATALOGUE_COVER_ASPECT}`}>
          <CoverImage
            slug={publication.slug}
            coverImageUrl={publication.cover_image_url}
            alt={publication.title}
            variant="catalogue"
            wrapperClassName={`relative h-full w-full overflow-hidden rounded-lg border border-slate-200 shadow ${publication.slug === "ca-journal-may-2026" ? "bg-[var(--icai-navy)]" : "bg-slate-100"}`}
          />
        </figure>
        <section>
          {publication.topic && (
            <span className="icai-badge rounded px-2 py-0.5">{publication.topic}</span>
          )}
          <h1 className="mt-2 text-3xl font-bold text-[var(--icai-navy)]">
            {publication.title}
          </h1>
          {publication.committee && (
            <p className="mt-2 text-slate-600">{publication.committee}</p>
          )}
          {date && (
            <p className="mt-2 text-sm text-slate-500">Release date: {date}</p>
          )}
          <p className="mt-6 leading-relaxed text-slate-700">{publication.synopsis}</p>
          <PublicationReadActions
            slug={slug}
            supportsFlipbook={publicationSupportsFlipbook(publication)}
          />
        </section>
      </div>
    </article>
  );
}
