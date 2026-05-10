/* ============================================
 * Database Actions (Server Actions)
 * All DB operations via Supabase
 * ============================================ */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  UserMovie,
  MovieStatus,
  Collection,
  CollectionType,
  CollectionMovie,
} from "@/lib/types";

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
export async function getRankedMovies(): Promise<UserMovie[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_movies")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "watched")
    .not("personal_rating", "is", null)
    .order("personal_rating", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as UserMovie[]) || [];
}

/** Get a specific user_movie entry by TMDB ID */
export async function getUserMovieByTmdbId(
  tmdbMovieId: number
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
    .eq("tmdb_movie_id", tmdbMovieId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserMovie | null;
}

/** Set a movie's status (watched, want_to_watch, not_interested) */
export async function setMovieStatus(
  tmdbMovieId: number,
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

  const payload = {
    user_id: user.id,
    tmdb_movie_id: tmdbMovieId,
    status,
    movie_title: movieTitle,
    movie_poster_path: moviePosterPath,
    movie_release_date: movieReleaseDate,
    movie_overview: movieOverview,
    watched_at: status === "watched" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_movies")
    .upsert(payload, {
      onConflict: "user_id,tmdb_movie_id",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/watchlist");
  return data as UserMovie;
}

/** Rate a movie (must be watched) */
export async function rateMovie(
  tmdbMovieId: number,
  rating: number
): Promise<UserMovie> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (rating < 0.5 || rating > 10) {
    throw new Error("Rating must be between 0.5 and 10");
  }

  const { data, error } = await supabase
    .from("user_movies")
    .update({
      personal_rating: rating,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("tmdb_movie_id", tmdbMovieId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data as UserMovie;
}

/** Remove a movie from user's list */
export async function removeUserMovie(tmdbMovieId: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_movies")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_movie_id", tmdbMovieId);

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

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
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
  updates: { name?: string; description?: string; cover_image_url?: string }
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
  tmdbMovieId: number,
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
        tmdb_movie_id: tmdbMovieId,
        movie_title: movieTitle,
        movie_poster_path: moviePosterPath,
        sort_order: nextOrder,
      },
      { onConflict: "collection_id,tmdb_movie_id" }
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
  tmdbMovieId: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collection_movies")
    .delete()
    .eq("collection_id", collectionId)
    .eq("tmdb_movie_id", tmdbMovieId);

  if (error) throw new Error(error.message);
  revalidatePath(`/collections/${collectionId}`);
}

// ---- Auth Helpers ----

/** Get current user profile */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Sign out */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
