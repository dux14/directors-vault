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
import CollectionDetailClient from "./CollectionDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;

  const [collections, movies, user] = await Promise.all([
    getUserCollections(),
    getCollectionMovies(id),
    getCurrentUser(),
  ]);

  const collection = collections.find((c) => c.id === id);
  if (!collection) notFound();

  const isOwner = user?.id === collection.user_id;

  // Ensure owner is in members table (idempotent)
  if (isOwner) {
    await ensureOwnerMember(id);
  }

  const [members, memberRatings, friendships] = await Promise.all([
    getCollectionMembers(id),
    getCollectionMemberRatings(id),
    isOwner ? getFriendships() : Promise.resolve({ friends: [], pendingReceived: [], pendingSent: [] }),
  ]);

  return (
    <CollectionDetailClient
      collection={collection}
      initialMovies={movies}
      members={members}
      memberRatings={memberRatings}
      friends={friendships.friends}
      isOwner={isOwner}
      currentUserId={user!.id}
    />
  );
}
