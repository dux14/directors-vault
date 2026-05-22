/* ============================================
 * Collection Detail Page
 * Shows movies within a specific collection
 * With shared collection support
 * ============================================ */

import {
  getUserCollections,
  getCollectionMovies,
  getCurrentUser,
} from "@/lib/actions";
import {
  getCollectionMembers,
  getCollectionMemberRatings,
  ensureOwnerMember,
} from "@/lib/collection-actions";
import { getFriendships } from "@/lib/social-actions";
import { getServerView } from "@/lib/view/server";
import CollectionDetailClient from "./CollectionDetailClient";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;

  const [collections, movies, user, initialView] = await Promise.all([
    getUserCollections(),
    getCollectionMovies(id),
    getCurrentUser(),
    getServerView(),
  ]);

  const collection = collections.find((c) => c.id === id);
  if (!collection) notFound();
  if (!user) notFound();

  const isOwner = user.id === collection.user_id;

  // Ensure owner is in members table (idempotent)
  if (isOwner) {
    await ensureOwnerMember(id);
  }

  const [members, memberRatings, friendships] = await Promise.all([
    getCollectionMembers(id),
    getCollectionMemberRatings(id),
    isOwner ? getFriendships() : Promise.resolve({ friends: [], pendingReceived: [], pendingSent: [] }),
  ]);

  let watchedIds: number[] = [];
  if (movies.length > 0) {
    const supabase = await createClient();
    const tmdbIds = movies.map((m) => m.tmdb_movie_id);
    const { data: watchedRows } = await supabase
      .from("user_movies")
      .select("tmdb_movie_id")
      .eq("user_id", user.id)
      .eq("status", "watched")
      .in("tmdb_movie_id", tmdbIds);
    watchedIds = (watchedRows ?? []).map((r) => r.tmdb_movie_id);
  }

  return (
    <CollectionDetailClient
      collection={collection}
      initialMovies={movies}
      members={members}
      memberRatings={memberRatings}
      friends={friendships.friends}
      isOwner={isOwner}
      currentUserId={user.id}
      watchedIds={watchedIds}
      initialView={initialView}
    />
  );
}
