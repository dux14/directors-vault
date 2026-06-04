/* ============================================
 * TMDB Actions (Server Actions)
 * Client components must call TMDB through these
 * so the API key stays server-side.
 * ============================================ */

"use server";

import { searchKeywords, type TMDBKeywordSearchResponse } from "@/lib/tmdb";

/** Search for keywords (autocomplete in FilterPanel) */
export async function searchKeywordsAction(
  query: string
): Promise<TMDBKeywordSearchResponse> {
  return searchKeywords(query);
}
