import Link from "next/link";
import { notFound } from "next/navigation";
import { SecureReader } from "@/components/reader/SecureReader";
import { fetchPublicationBySlug } from "@/lib/data/publications";
import { hasFlipbook } from "@/lib/flipbook";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publication = await fetchPublicationBySlug(slug);
  if (!publication) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={`/publications/${slug}`}
        className="text-sm text-[var(--icai-navy)] hover:underline"
      >
        ← Publication details
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[var(--icai-navy)]">
        {publication.title}
      </h1>
      {hasFlipbook(slug) && (
        <Link
          href={`/flipbook/${slug}`}
          className="mt-3 inline-block text-sm font-semibold text-[var(--icai-navy)] hover:text-[var(--icai-gold)]"
        >
          ← Open flipbook reader
        </Link>
      )}
      <SecureReader slug={slug} title={publication.title} />
    </div>
  );
}
