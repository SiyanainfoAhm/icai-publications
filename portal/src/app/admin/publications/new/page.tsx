import { PublicationUploadForm } from "@/components/admin/PublicationUploadForm";

export default function NewPublicationPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[var(--icai-navy)]">New publication</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Create a catalogue entry for PDF publications, web articles, or combined PDF and
        article content. Configure visibility, download permissions, and publishing status
        for the ICAI demo portal.
      </p>
      <PublicationUploadForm />
    </>
  );
}
