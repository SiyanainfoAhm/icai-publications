import { notFound, redirect } from "next/navigation";
import { FlipbookReader } from "@/components/reader/FlipbookReader";
import { canAccessFlipbook } from "@/lib/auth/access";
import { getTokenFromCookies, resolveSessionUser } from "@/lib/auth/session";
import { fetchPublicationBySlug } from "@/lib/data/publications";
import { getFlipbookPages } from "@/lib/flipbook-content";
import { hasFlipbook } from "@/lib/flipbook";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FlipbookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
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

  const pages = getFlipbookPages(slug);
  const pageCount = pages?.length ?? 0;
  let initialPage = 0;
  if (sp.page) {
    const n = parseInt(sp.page, 10);
    if (!Number.isNaN(n)) initialPage = Math.max(0, Math.min(pageCount - 1, n - 1));
  }

  return (
    <FlipbookReader
      slug={slug}
      title={publication.title}
      backHref={`/publications/${slug}`}
      initialPage={initialPage}
      highlightQuery={sp.q ?? ""}
    />
  );
}
