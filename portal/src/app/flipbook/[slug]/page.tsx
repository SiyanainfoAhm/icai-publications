import { notFound, redirect } from "next/navigation";
import { FlipbookReader } from "@/components/reader/FlipbookReader";
import { canAccessFlipbook } from "@/lib/auth/access";
import { getTokenFromCookies, resolveSessionUser } from "@/lib/auth/session";
import { fetchPublicationBySlug } from "@/lib/data/publications";
import { hasFlipbook } from "@/lib/flipbook";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function FlipbookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasFlipbook(slug)) notFound();

  const publication = await fetchPublicationBySlug(slug);
  if (!publication) notFound();

  const token = await getTokenFromCookies();
  const user = await resolveSessionUser(token);

  if (!canAccessFlipbook(user)) {
    redirect(`/login?redirect=${encodeURIComponent(`/flipbook/${slug}`)}`);
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("icai_publication_access_logs").insert({
    user_id: user!.id,
    publication_id: publication.id,
    access_type: "flipbook",
    ip_address: null,
    user_agent: null,
  });

  return (
    <FlipbookReader
      slug={slug}
      title={publication.title}
      backHref={`/publications/${slug}`}
    />
  );
}
