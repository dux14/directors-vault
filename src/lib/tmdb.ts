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
  results: (TMDBMovie & { media_type: "movie" } | TMDBPersonSearchResult)[];
  total_pages: number;
  total_results: number;
}

export interface TMDBPersonSearchResponse {
  page: number;
  results: TMDBPersonSearchResult[];
  total_pages: number;
  total_results: number;
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
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB API key is not configured");
  }

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    language: "es-MX",
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
      return tmdbFetch<T>(endpoint, params);
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
  page: number = 1
): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBSearchResponse>("/search/movie", {
    query: query.trim(),
    page: page.toString(),
    include_adult: "false",
  });
}

/** Get full movie details with credits, similar, recommendations, and videos */
export async function getMovieDetail(
  movieId: number
): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${movieId}`, {
    append_to_response: "credits,similar,recommendations,videos",
  });
}

/** Get list of all movie genres */
export async function getGenres(): Promise<TMDBGenre[]> {
  const response = await tmdbFetch<{ genres: TMDBGenre[] }>(
    "/genre/movie/list"
  );
  return response.genres;
}

/** Discover movies with advanced filters */
export async function discoverMovies(
  params: {
    page?: number;
    sort_by?: string;
    with_genres?: string;
    year?: number;
    "vote_average.gte"?: number;
  } = {}
): Promise<TMDBSearchResponse> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sort_by || "popularity.desc",
    include_adult: "false",
  };
  if (params.with_genres) queryParams.with_genres = params.with_genres;
  if (params.year) queryParams.year = params.year.toString();
  if (params["vote_average.gte"])
    queryParams["vote_average.gte"] = params["vote_average.gte"].toString();

  return tmdbFetch<TMDBSearchResponse>("/discover/movie", queryParams);
}

/** Get trending movies */
export async function getTrending(
  timeWindow: "day" | "week" = "week"
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>(`/trending/movie/${timeWindow}`);
}

/** Get a TMDB collection (saga/franchise) */
export async function getCollection(
  collectionId: number
): Promise<TMDBCollectionDetail> {
  return tmdbFetch<TMDBCollectionDetail>(`/collection/${collectionId}`);
}

/** Get a person's movie credits */
export async function getPersonMovieCredits(
  personId: number
): Promise<TMDBPersonCredits> {
  return tmdbFetch<TMDBPersonCredits>(`/person/${personId}/movie_credits`);
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
  page: number = 1
): Promise<TMDBMultiSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBMultiSearchResponse>("/search/multi", {
    query: query.trim(),
    page: page.toString(),
    include_adult: "false",
  });
}

/** Search for people only */
export async function searchPerson(
  query: string,
  page: number = 1
): Promise<TMDBPersonSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return tmdbFetch<TMDBPersonSearchResponse>("/search/person", {
    query: query.trim(),
    page: page.toString(),
  });
}

/** Get person details */
export async function getPersonDetail(
  personId: number
): Promise<TMDBPerson> {
  return tmdbFetch<TMDBPerson>(`/person/${personId}`);
}

/** Get now playing movies */
export async function getNowPlaying(
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/now_playing", {
    page: page.toString(),
  });
}

/** Get top rated movies of all time */
export async function getTopRated(
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/top_rated", {
    page: page.toString(),
  });
}
