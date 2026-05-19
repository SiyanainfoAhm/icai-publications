import { CatalogueBrowser } from "@/components/catalogue/CatalogueBrowser";
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
      <CatalogueBrowser publications={publications} configured={configured} />
    </div>
  );
}
