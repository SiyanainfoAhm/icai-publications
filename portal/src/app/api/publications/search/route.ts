import { NextRequest, NextResponse } from "next/server";
import { searchPublications, type CatalogueSearchFilters } from "@/lib/catalogue-search";
import { fetchPublishedCatalogue } from "@/lib/data/publications";
import type { PublicationType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const filters: CatalogueSearchFilters = {
    q: sp.get("q") ?? undefined,
    committee: sp.get("committee") ?? undefined,
    topic: sp.get("topic") ?? undefined,
    type: (sp.get("type") as PublicationType) || undefined,
    dateFrom: sp.get("dateFrom") ?? undefined,
    dateTo: sp.get("dateTo") ?? undefined,
  };

  const catalogue = await fetchPublishedCatalogue();
  const results = searchPublications(catalogue, filters).map((h) => ({
    id: h.publication.id,
    slug: h.publication.slug,
    title: h.publication.title,
    committee: h.publication.committee,
    topic: h.publication.topic,
    publication_type: h.publication.publication_type,
    release_date: h.publication.release_date,
    is_featured: h.publication.is_featured,
    synopsis: h.publication.synopsis,
    score: h.score,
    snippet: h.snippet,
    matchedFields: h.matchedFields,
  }));

  return NextResponse.json({
    count: results.length,
    results,
    note: "Metadata and synopsis search (demo). Production will index full PDF text.",
  });
}
