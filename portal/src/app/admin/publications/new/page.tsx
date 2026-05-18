import { PublicationUploadForm } from "@/components/admin/PublicationUploadForm";

export default function NewPublicationPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[var(--icai-navy)]">Upload publication</h1>
      <p className="mt-2 text-sm text-slate-600">
        Add a new item to the publications catalogue. Attach cover image URL and article
        content for the secure reader.
      </p>
      <PublicationUploadForm />
    </>
  );
}
