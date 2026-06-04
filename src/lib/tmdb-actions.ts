/* ============================================
 * TMDB Actions (Server Actions)
 * Client components must call TMDB through these
 * so the API key stays server-side.
 * ============================================ */

"use server";

import {
  searchKeywords,
  searchMulti,
  searchPerson,
  getTrending,
  getTrendingTv,
  getGenres,
  getTvGenres,
  discoverMovies,
  discoverTv,
  type TMDBKeywordSearchResponse,
  type TMDBMultiSearchResponse,
  type TMDBPersonSearchResponse,
  type TMDBSearchResponse,
  type TMDBTvSearchResponse,
  type TMDBGenre,
} from "@/lib/tmdb";

/** Search for keywords (autocomplete in FilterPanel) */
export async function searchKeywordsAction(
  query: string
): Promise<TMDBKeywordSearchResponse> {
  return searchKeywords(query);
}

/** Multi search — movies + TV (search page, Títulos tab) */
export async function searchMultiAction(
  query: string,
  page: number = 1,
  locale?: string
): Promise<TMDBMultiSearchResponse> {
  return searchMulti(query, page, locale);
}

/** Person search (search page, Personas tab) */
export async function searchPersonAction(
  query: string,
  page: number = 1,
  locale?: string
): Promise<TMDBPersonSearchResponse> {
  return searchPerson(query, page, locale);
}

/** Trending movies (search page initial state) */
export async function getTrendingAction(
  timeWindow: "day" | "week" = "week",
  locale?: string
): Promise<TMDBSearchResponse> {
  return getTrending(timeWindow, locale);
}

/** Trending TV (search page initial state) */
export async function getTrendingTvAction(
  timeWindow: "day" | "week" = "week",
  locale?: string
): Promise<TMDBTvSearchResponse> {
  return getTrendingTv(timeWindow, locale);
}

/** Movie genres (FilterPanel genre list) */
export async function getGenresAction(locale?: string): Promise<TMDBGenre[]> {
  return getGenres(locale);
}

/** TV genres (FilterPanel genre list) */
export async function getTvGenresAction(locale?: string): Promise<TMDBGenre[]> {
  return getTvGenres(locale);
}

/** Discover movies with filters (search page discover mode) */
export async function discoverMoviesAction(
  params: Parameters<typeof discoverMovies>[0] = {},
  locale?: string
): Promise<TMDBSearchResponse> {
  return discoverMovies(params, locale);
}

/** Discover TV with filters (search page discover mode) */
export async function discoverTvAction(
  params: Parameters<typeof discoverTv>[0] = {},
  locale?: string
): Promise<TMDBTvSearchResponse> {
  return discoverTv(params, locale);
}
