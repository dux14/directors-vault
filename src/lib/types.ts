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
  /** Letter grade stored as integer: 8=S, 7=A+, 6=A, 5=B, 4=C, 3=D, 2=E, 1=F */
  personal_rating: number | null;
  /** Position within the tier for intra-tier ordering (lower = higher rank) */
  tier_position: number;
  review_notes: string | null;
  watch_count: number;
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

// ---- Social Types ----

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export interface UserPublicProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string;
  friend_code: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  // Joined profile data
  profile?: UserPublicProfile;
}

export interface CollectionMember {
  id: string;
  collection_id: string;
  user_id: string;
  role: "owner" | "member";
  added_at: string;
  profile?: UserPublicProfile;
}

