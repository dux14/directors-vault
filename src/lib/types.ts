/* ============================================
 * Database Types
 * Shared types for the application
 * ============================================ */

export type MovieStatus = "watched" | "want_to_watch" | "not_interested";

export type CollectionType =
  | "director"
  | "actor"
  | "genre"
  | "saga"
  | "custom";

export interface UserMovie {
  id: string;
  user_id: string;
  tmdb_movie_id: number;
  status: MovieStatus;
  personal_rating: number | null;
  review_notes: string | null;
  watched_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined from TMDB (client-side enrichment)
  movie_title?: string;
  movie_poster_path?: string | null;
  movie_release_date?: string;
  movie_overview?: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: CollectionType;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionMovie {
  id: string;
  collection_id: string;
  tmdb_movie_id: number;
  sort_order: number;
  added_at: string;
  // Joined from TMDB (client-side enrichment)
  movie_title?: string;
  movie_poster_path?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface RankedMovie extends UserMovie {
  rank: number;
}
