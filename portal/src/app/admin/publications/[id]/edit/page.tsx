import { PublicationUploadForm } from "@/components/admin/PublicationUploadForm";

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <h1 className="text-2xl font-bold text-[var(--icai-navy)]">Edit publication</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Update catalogue metadata, cover image, PDF, article content, and publishing settings.
        Leave file fields empty to keep the current cover or PDF.
      </p>
      <PublicationUploadForm publicationId={id} />
    </>
  );
}
