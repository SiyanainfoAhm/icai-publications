import { NextRequest, NextResponse } from "next/server";
import { suggestTerms } from "@/lib/catalogue-search";
import { fetchPublishedCatalogue } from "@/lib/data/publications";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const catalogue = await fetchPublishedCatalogue();
  const suggestions = suggestTerms(catalogue, q);
  return NextResponse.json({ suggestions });
}
