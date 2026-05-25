/* ============================================
 * Database Actions (Server Actions)
 * All DB operations via Supabase
 * ============================================ */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  UserMovie,
  MediaType,
  MovieStatus,
  Collection,
  CollectionType,
  CollectionMovie,
} from "@/lib/types";

// ---- Auth ----

/** Get the current authenticated user */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ---- User Movies ----

/** Get all movies for the current user with optional status filter */
export async function getUserMovies(
  status?: MovieStatus
): Promise<UserMovie[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("user_movies")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as UserMovie[]) || [];
}

/** Get the user's ranked movies (watched, sorted by rating desc) */
export async function getRankedMovies(mediaType?: MediaType): Promise<UserMovie[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("user_movies")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "watched")
    .not("personal_rating", "is", null)
    .order("personal_rating", { ascending: false })
    .order("tier_position", { ascending: true });

  if (mediaType) {
    query = query.eq("media_type", mediaType);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as UserMovie[]) || [];
}

/** Get a specific user_movie entry by TMDB ID */
export async function getUserMovieByTmdbId(
  tmdbId: number,
  mediaType: MediaType
): Promise<UserMovie | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_movies")
    .select("*")
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserMovie | null;
}

/** Set a movie's status (watched, want_to_watch, not_interested) */
export async function setMovieStatus(
  tmdbId: number,
  mediaType: MediaType,
  status: MovieStatus,
  movieTitle: string,
  moviePosterPath: string | null,
  movieReleaseDate: string,
  movieOverview: string
): Promise<UserMovie> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload: Record<string, unknown> = {
    user_id: user.id,
    tmdb_id: tmdbId,
    media_type: mediaType,
    status,
    movie_title: movieTitle,
    movie_poster_path: moviePosterPath,
    movie_release_date: movieReleaseDate,
    movie_overview: movieOverview,
    watched_at: status === "watched" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  // Set initial watch count when marking as watched
  if (status === "watched") {
    payload.watch_count = 1;
  }

  const { data, error } = await supabase
    .from("user_movies")
    .upsert(payload, {
      onConflict: "user_id,tmdb_id,media_type",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/watchlist");
  return data as UserMovie;
}

/** Rate a movie with letter grade (1=F ... 8=S) */
export async function rateMovie(
  tmdbId: number,
  mediaType: MediaType,
  rating: number
): Promise<UserMovie> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (rating < 1 || rating > 8 || !Number.isInteger(rating)) {
    throw new Error("Rating must be an integer between 1 and 8");
  }

  // Get current max tier_position for this tier
  const { data: maxPos } = await supabase
    .from("user_movies")
    .select("tier_position")
    .eq("user_id", user.id)
    .eq("personal_rating", rating)
    .order("tier_position", { ascending: false })
    .limit(1);

  const nextPosition = maxPos && maxPos.length > 0 ? maxPos[0].tier_position + 1 : 0;

  const { data, error } = await supabase
    .from("user_movies")
    .update({
      personal_rating: rating,
      tier_position: nextPosition,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data as UserMovie;
}

/** Update watch count for a movie */
export async function updateWatchCount(
  tmdbId: number,
  mediaType: MediaType,
  count: number
): Promise<UserMovie> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (count < 0) throw new Error("Watch count cannot be negative");

  const { data, error } = await supabase
    .from("user_movies")
    .update({
      watch_count: count,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data as UserMovie;
}

/** Remove a movie from user's list */
export async function removeUserMovie(tmdbId: number, mediaType: MediaType): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_movies")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/watchlist");
}

// ---- Collections ----

/** Get all collections for the current user */
export async function getUserCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Get collections where user is owner OR member
  // Using the RLS policy "Users can view own or shared collections"
  // But we need to explicitly query it if we want both. Since RLS handles visibility,
  // we can just select all collections we have access to?
  // Wait, if we just do `.from("collections").select("*")`, RLS will filter it to only those we own or are members of!
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Collection[]) || [];
}

/** Create a new collection */
export async function createCollection(
  name: string,
  type: CollectionType,
  description?: string,
  coverImageUrl?: string
): Promise<Collection> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      name,
      type,
      description: description || null,
      cover_image_url: coverImageUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/collections");
  return data as Collection;
}

/** Update a collection */
export async function updateCollection(
  collectionId: string,
  updates: { name?: string; description?: string; cover_image_url?: string; type?: CollectionType }
): Promise<Collection> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collections")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/collections");
  return data as Collection;
}

/** Delete a collection */
export async function deleteCollection(collectionId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/collections");
}

// ---- Collection Movies ----

/** Get movies in a collection */
export async function getCollectionMovies(
  collectionId: string
): Promise<CollectionMovie[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_movies")
    .select("*")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as CollectionMovie[]) || [];
}

/** Add a movie to a collection */
export async function addMovieToCollection(
  collectionId: string,
  tmdbId: number,
  mediaType: MediaType,
  movieTitle: string,
  moviePosterPath: string | null
): Promise<CollectionMovie> {
  const supabase = await createClient();

  // Get current max sort_order
  const { data: existing } = await supabase
    .from("collection_movies")
    .select("sort_order")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("collection_movies")
    .upsert(
      {
        collection_id: collectionId,
        tmdb_id: tmdbId,
        media_type: mediaType,
        movie_title: movieTitle,
        movie_poster_path: moviePosterPath,
        sort_order: nextOrder,
      },
      { onConflict: "collection_id,tmdb_id,media_type" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/collections/${collectionId}`);
  return data as CollectionMovie;
}

/** Remove a movie from a collection */
export async function removeMovieFromCollection(
  collectionId: string,
  tmdbId: number,
  mediaType: MediaType
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collection_movies")
    .delete()
    .eq("collection_id", collectionId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);

  if (error) throw new Error(error.message);
  revalidatePath(`/collections/${collectionId}`);
}

/** Get user collections with info about whether a specific movie is already in them */
export async function getUserCollectionsForMovie(
  tmdbId: number,
  mediaType: MediaType
): Promise<(Collection & { hasMovie: boolean })[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [collectionsRes, moviesRes] = await Promise.all([
    supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("collection_movies")
      .select("collection_id")
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType),
  ]);

  const collections = (collectionsRes.data || []) as Collection[];
  const movieCollectionIds = new Set(
    (moviesRes.data || []).map((m: { collection_id: string }) => m.collection_id)
  );

  return collections.map((c) => ({
    ...c,
    hasMovie: movieCollectionIds.has(c.id),
  }));
}

/** Create a collection with multiple movies in one go (filmography export) */
export async function createCollectionWithMovies(
  name: string,
  type: CollectionType,
  movies: { tmdb_id: number; media_type: MediaType; movie_title: string; movie_poster_path: string | null }[]
): Promise<Collection> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Create collection
  const { data: collection, error: collError } = await supabase
    .from("collections")
    .insert({ name, type, user_id: user.id })
    .select()
    .single();

  if (collError) throw new Error(collError.message);

  // Insert all movies
  if (movies.length > 0) {
    const movieRows = movies.map((m, i) => ({
      collection_id: collection.id,
      tmdb_id: m.tmdb_id,
      media_type: m.media_type,
      movie_title: m.movie_title,
      movie_poster_path: m.movie_poster_path,
      sort_order: i,
    }));

    const { error: moviesError } = await supabase
      .from("collection_movies")
      .upsert(movieRows, { onConflict: "collection_id,tmdb_id,media_type" });

    if (moviesError) throw new Error(moviesError.message);
  }

  revalidatePath("/collections");
  return collection as Collection;
}

// ---- Auth Helpers ----

/** Swap tier_position with adjacent movie in the same tier */
export async function swapTierPosition(
  movieId: string,
  direction: "up" | "down"
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the target movie
  const { data: target, error: targetErr } = await supabase
    .from("user_movies")
    .select("id, personal_rating, tier_position")
    .eq("id", movieId)
    .eq("user_id", user.id)
    .single();

  if (targetErr || !target) throw new Error("Movie not found");

  // Find the adjacent movie in the same tier
  const adjacentPosition = direction === "up"
    ? target.tier_position - 1
    : target.tier_position + 1;

  const { data: adjacent } = await supabase
    .from("user_movies")
    .select("id, tier_position")
    .eq("user_id", user.id)
    .eq("personal_rating", target.personal_rating)
    .eq("tier_position", adjacentPosition)
    .single();

  if (!adjacent) return; // Already at boundary, no-op

  // Swap positions
  const { error: swapErr } = await supabase
    .from("user_movies")
    .update({ tier_position: adjacent.tier_position })
    .eq("id", target.id);

  if (swapErr) throw new Error(swapErr.message);

  const { error: swapErr2 } = await supabase
    .from("user_movies")
    .update({ tier_position: target.tier_position })
    .eq("id", adjacent.id);

  if (swapErr2) throw new Error(swapErr2.message);

  revalidatePath("/");
}

/** Sign out */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
