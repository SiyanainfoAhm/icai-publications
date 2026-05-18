import { PublicationCard } from "@/components/PublicationCard";
import { fetchPublishedCatalogue } from "@/lib/data/publications";

export default async function HomePage() {
  const publications = await fetchPublishedCatalogue();
  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVER_KEY,
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10 rounded-lg border border-[var(--icai-gold)] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[var(--icai-navy)]">
          ICAI Publications Catalogue
        </h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Browse official publications from the Institute of Chartered Accountants of India.
          Metadata is available to all visitors; reading the full publication requires
          sign-in via email OTP (non-members) or ICAI member access (demo).
        </p>
      </section>

      {!configured && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The catalogue is not yet connected to the publication service. Please contact
          your administrator to complete setup.
        </p>
      )}

      {publications.length === 0 ? (
        <p className="text-slate-600">No published items yet.</p>
      ) : (
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((p) => (
            <PublicationCard key={p.id} publication={p} />
          ))}
        </div>
      )}
    </div>
  );
}
