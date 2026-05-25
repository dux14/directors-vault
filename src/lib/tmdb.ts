/* ============================================
 * TMDB API Service Layer
 * Handles all communication with The Movie Database API
 * Includes response caching to respect rate limits
 * ============================================ */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Image size helpers
export const IMAGE_SIZES = {
  poster: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/w500`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    small: `${TMDB_IMAGE_BASE}/w300`,
    medium: `${TMDB_IMAGE_BASE}/w780`,
    large: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  profile: {
    small: `${TMDB_IMAGE_BASE}/w45`,
    medium: `${TMDB_IMAGE_BASE}/w185`,
    large: `${TMDB_IMAGE_BASE}/h632`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
} as const;

// ---- Types ----

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
}

export interface TMDBMovieDetail extends Omit<TMDBMovie, "genre_ids"> {
  genres: { id: number; name: string }[];
  runtime: number | null;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  homepage: string | null;
  imdb_id: string | null;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  similar?: { results: TMDBMovie[] };
  recommendations?: { results: TMDBMovie[] };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  "watch/providers"?: {
    results: Record<string, {
      link: string;
      flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
      rent?: { provider_id: number; provider_name: string; logo_path: string }[];
      buy?: { provider_id: number; provider_name: string; logo_path: string }[];
    }>;
  };
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBCollectionDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: TMDBMovie[];
}

export interface TMDBPersonCredits {
  id: number;
  cast: (TMDBMovie & { character: string })[];
  crew: (TMDBMovie & { job: string; department: string })[];
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  also_known_as?: string[];
  gender: number;
  known_for?: TMDBMovie[];
}

export interface TMDBPersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: TMDBMovie[];
  media_type: "person";
}

export interface TMDBMultiSearchResponse {
  page: number;
  results: (
    | (TMDBMovie & { media_type: "movie" })
    | (TMDBTvShow & { media_type: "tv" })
    | TMDBPersonSearchResult
  )[];
  total_pages: number;
  total_results: number;
}

export interface TMDBPersonSearchResponse {
  page: number;
  results: TMDBPersonSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TMDBTvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  vote_average: number;
}

export interface TMDBTvDetail extends Omit<TMDBTvShow, "genre_ids"> {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  type: string;
  tagline: string;
  homepage: string | null;
  created_by: { id: number; name: string; profile_path: string | null }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  seasons: TMDBSeason[];
  last_air_date: string;
  in_production: boolean;
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  "watch/providers"?: {
    results: Record<string, {
      link: string;
      flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
      rent?: { provider_id: number; provider_name: string; logo_path: string }[];
      buy?: { provider_id: number; provider_name: string; logo_path: string }[];
    }>;
  };
  recommendations?: { results: TMDBTvShow[] };
  similar?: { results: TMDBTvShow[] };
}

export interface TMDBTvSearchResponse {
  page: number;
  results: TMDBTvShow[];
  total_pages: number;
  total_results: number;
}

export interface TMDBKeyword {
  id: number;
  name: string;
}

export interface TMDBKeywordSearchResponse {
  page: number;
  results: TMDBKeyword[];
  total_pages: number;
  total_results: number;
}

export interface MediaItem {
  id: number;
  mediaType: "movie" | "tv";
  displayTitle: string;
  posterPath: string | null;
  backdropPath: string | null;
  displayDate: string;
  voteAverage: number;
  overview: string;
  genreIds: number[];
}

export function movieToMediaItem(m: TMDBMovie): MediaItem {
  return {
    id: m.id,
    mediaType: "movie",
    displayTitle: m.title,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    displayDate: m.release_date,
    voteAverage: m.vote_average,
    overview: m.overview,
    genreIds: m.genre_ids,
  };
}

export function tvToMediaItem(tv: TMDBTvShow): MediaItem {
  return {
    id: tv.id,
    mediaType: "tv",
    displayTitle: tv.name,
    posterPath: tv.poster_path,
    backdropPath: tv.backdrop_path,
    displayDate: tv.first_air_date,
    voteAverage: tv.vote_average,
    overview: tv.overview,
    genreIds: tv.genre_ids,
  };
}

// ---- In-Memory Cache ----

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ---- API Fetch Helper ----

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
  language: string = "es-MX"
): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB API key is not configured");
  }

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    language,
    ...params,
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;
  const cacheKey = url;

  // Check cache first
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const response = await fetch(url, {
    next: { revalidate: 600 }, // Next.js cache: 10 min
  });

  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited — wait and retry once
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return tmdbFetch<T>(endpoint, params, language);
    }
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  setCache(cacheKey, data);
  return data as T;
}

// ---- Public API Methods ----

/** Search movies by query text */
export async function searchMovies(
  query: string,
  page: number = 1,
  locale?: string
): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBSearchResponse>("/search/movie", {
    query: query.trim(),
    page: page.toString(),
    include_adult: "false",
  }, locale);
}

/** Get full movie details with credits, similar, recommendations, and videos */
export async function getMovieDetail(
  movieId: number,
  locale?: string
): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${movieId}`, {
    append_to_response: "credits,similar,recommendations,videos,watch/providers",
    include_video_language: "en,es,null",
  }, locale);
}

/** Get list of all movie genres */
export async function getGenres(locale?: string): Promise<TMDBGenre[]> {
  const response = await tmdbFetch<{ genres: TMDBGenre[] }>(
    "/genre/movie/list", {}, locale
  );
  return response.genres;
}

/** Discover movies with advanced filters */
export async function discoverMovies(
  params: {
    page?: number;
    sort_by?: string;
    with_genres?: string;
    with_keywords?: string;
    year?: number;
    "vote_average.gte"?: number;
  } = {},
  locale?: string
): Promise<TMDBSearchResponse> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sort_by || "popularity.desc",
    include_adult: "false",
  };
  if (params.with_genres) queryParams.with_genres = params.with_genres;
  if (params.with_keywords) queryParams.with_keywords = params.with_keywords;
  if (params.year) queryParams.year = params.year.toString();
  if (params["vote_average.gte"])
    queryParams["vote_average.gte"] = params["vote_average.gte"].toString();

  return tmdbFetch<TMDBSearchResponse>("/discover/movie", queryParams, locale);
}

/** Get trending movies */
export async function getTrending(
  timeWindow: "day" | "week" = "week",
  locale?: string
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>(`/trending/movie/${timeWindow}`, {}, locale);
}

/** Get a TMDB collection (saga/franchise) */
export async function getCollection(
  collectionId: number,
  locale?: string
): Promise<TMDBCollectionDetail> {
  return tmdbFetch<TMDBCollectionDetail>(`/collection/${collectionId}`, {}, locale);
}

/** Get a person's movie credits */
export async function getPersonMovieCredits(
  personId: number,
  locale?: string
): Promise<TMDBPersonCredits> {
  return tmdbFetch<TMDBPersonCredits>(`/person/${personId}/movie_credits`, {}, locale);
}

/** Get poster URL with fallback */
export function getPosterUrl(
  path: string | null,
  size: keyof (typeof IMAGE_SIZES)["poster"] = "medium"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `${IMAGE_SIZES.poster[size]}${path}`;
}

/** Get backdrop URL with fallback */
export function getBackdropUrl(
  path: string | null,
  size: keyof (typeof IMAGE_SIZES)["backdrop"] = "large"
): string {
  if (!path) return "/placeholder-backdrop.svg";
  return `${IMAGE_SIZES.backdrop[size]}${path}`;
}

/** Get profile URL with fallback */
export function getProfileUrl(
  path: string | null,
  size: keyof (typeof IMAGE_SIZES)["profile"] = "medium"
): string {
  if (!path) return "/placeholder-profile.svg";
  return `${IMAGE_SIZES.profile[size]}${path}`;
}

/** Multi-search: movies + people in a single query */
export async function searchMulti(
  query: string,
  page: number = 1,
  locale?: string
): Promise<TMDBMultiSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBMultiSearchResponse>("/search/multi", {
    query: query.trim(),
    page: page.toString(),
    include_adult: "false",
  }, locale);
}

/** Search for people only */
export async function searchPerson(
  query: string,
  page: number = 1,
  locale?: string
): Promise<TMDBPersonSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBPersonSearchResponse>("/search/person", {
    query: query.trim(),
    page: page.toString(),
  }, locale);
}

/** Get person details */
export async function getPersonDetail(
  personId: number,
  locale?: string
): Promise<TMDBPerson> {
  return tmdbFetch<TMDBPerson>(`/person/${personId}`, {}, locale);
}

/** Get now playing movies */
export async function getNowPlaying(
  page: number = 1,
  locale?: string
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/now_playing", {
    page: page.toString(),
  }, locale);
}

/** Get top rated movies of all time */
export async function getTopRated(
  page: number = 1,
  locale?: string
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/top_rated", {
    page: page.toString(),
  }, locale);
}

/** Get movie recommendations */
export async function getMovieRecommendations(
  movieId: number,
  locale?: string
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>(`/movie/${movieId}/recommendations`, {}, locale);
}

/** Get full TV show details with credits, videos, watch providers, recommendations, and similar */
export async function getTvDetail(tvId: number, locale?: string): Promise<TMDBTvDetail> {
  return tmdbFetch<TMDBTvDetail>(`/tv/${tvId}`, {
    append_to_response: "credits,videos,watch/providers,recommendations,similar",
    include_video_language: "en,es,null",
  }, locale);
}

/** Search TV shows by query text */
export async function searchTv(query: string, page: number = 1, locale?: string): Promise<TMDBTvSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBTvSearchResponse>("/search/tv", {
    query: query.trim(),
    page: page.toString(),
    include_adult: "false",
  }, locale);
}

/** Discover TV shows with advanced filters */
export async function discoverTv(
  params: { page?: number; sort_by?: string; with_genres?: string; with_keywords?: string; } = {},
  locale?: string
): Promise<TMDBTvSearchResponse> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sort_by || "popularity.desc",
    include_adult: "false",
  };
  if (params.with_genres) queryParams.with_genres = params.with_genres;
  if (params.with_keywords) queryParams.with_keywords = params.with_keywords;
  return tmdbFetch<TMDBTvSearchResponse>("/discover/tv", queryParams, locale);
}

/** Get list of all TV genres */
export async function getTvGenres(locale?: string): Promise<TMDBGenre[]> {
  const response = await tmdbFetch<{ genres: TMDBGenre[] }>("/genre/tv/list", {}, locale);
  return response.genres;
}

/** Get trending TV shows */
export async function getTrendingTv(timeWindow: "day" | "week" = "week", locale?: string): Promise<TMDBTvSearchResponse> {
  return tmdbFetch<TMDBTvSearchResponse>(`/trending/tv/${timeWindow}`, {}, locale);
}

/** Get TV show recommendations */
export async function getTvRecommendations(tvId: number, locale?: string): Promise<TMDBTvSearchResponse> {
  return tmdbFetch<TMDBTvSearchResponse>(`/tv/${tvId}/recommendations`, {}, locale);
}

/** Get TV shows currently on the air */
export async function getTvOnTheAir(page: number = 1, locale?: string): Promise<TMDBTvSearchResponse> {
  return tmdbFetch<TMDBTvSearchResponse>("/tv/on_the_air", { page: page.toString() }, locale);
}

/** Get top rated TV shows */
export async function getTopRatedTv(page: number = 1, locale?: string): Promise<TMDBTvSearchResponse> {
  return tmdbFetch<TMDBTvSearchResponse>("/tv/top_rated", { page: page.toString() }, locale);
}

/** Get a person's TV credits */
export async function getPersonTvCredits(
  personId: number, locale?: string
): Promise<{ id: number; cast: (TMDBTvShow & { character: string })[]; crew: (TMDBTvShow & { job: string; department: string })[] }> {
  return tmdbFetch(`/person/${personId}/tv_credits`, {}, locale);
}

/** Search for keywords */
export async function searchKeywords(query: string): Promise<TMDBKeywordSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBKeywordSearchResponse>("/search/keyword", { query: query.trim() });
}

