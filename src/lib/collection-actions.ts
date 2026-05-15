/* ============================================
 * Collection Actions — Shared collections logic
 * Invite, respond, get members, get ratings
 * ============================================ */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CollectionMember {
  id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profile?: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface CollectionInvitation {
  id: string;
  collection_id: string;
  inviter_id: string;
  invitee_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  collection?: { name: string; type: string };
  inviter?: { display_name: string | null; email: string };
}

/** Get members of a collection with their profiles */
export async function getCollectionMembers(
  collectionId: string
): Promise<CollectionMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_members")
    .select("*, profile:profiles(display_name, email, avatar_url)")
    .eq("collection_id", collectionId)
    .order("joined_at", { ascending: true });

  if (error) return [];
  return (data || []) as CollectionMember[];
}

/** Invite a friend to a collection */
export async function inviteToCollection(
  collectionId: string,
  friendUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Check if already invited
  const { data: existing } = await supabase
    .from("collection_invitations")
    .select("id, status")
    .eq("collection_id", collectionId)
    .eq("invitee_id", friendUserId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "pending")
      return { success: false, error: "Already invited" };
    if (existing.status === "accepted")
      return { success: false, error: "Already a member" };
    // If declined, allow re-invite by updating status
    await supabase
      .from("collection_invitations")
      .update({ status: "pending" })
      .eq("id", existing.id);
    return { success: true };
  }

  const { error } = await supabase.from("collection_invitations").insert({
    collection_id: collectionId,
    inviter_id: user.id,
    invitee_id: friendUserId,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Respond to an invitation (accept/decline) */
export async function respondToInvitation(
  invitationId: string,
  action: "accepted" | "declined"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: invitation, error: lookupErr } = await supabase
    .from("collection_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("invitee_id", user.id)
    .single();

  if (lookupErr || !invitation) {
    return { success: false, error: lookupErr?.message ?? "Invitation not found" };
  }

  const { error: updateErr } = await supabase
    .from("collection_invitations")
    .update({ status: action })
    .eq("id", invitationId);

  if (updateErr) return { success: false, error: updateErr.message };

  if (action === "accepted") {
    const { error: memberErr } = await supabase.from("collection_members").upsert(
      {
        collection_id: invitation.collection_id,
        user_id: user.id,
        role: "member",
      },
      { onConflict: "collection_id,user_id" }
    );

    if (memberErr) return { success: false, error: memberErr.message };
  }

  revalidatePath("/social");
  revalidatePath("/collections");
  return { success: true };
}

/** Get pending invitations for the current user — uses SECURITY DEFINER RPC
 * to bypass the RLS limitation that hides collections from pending invitees. */
export async function getPendingInvitations(): Promise<CollectionInvitation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_pending_invitations_for_user");

  if (error || !data) {
    if (error) console.error("getPendingInvitations RPC failed:", error.message);
    return [];
  }

  return (
    data as Array<{
      id: string;
      collection_id: string;
      status: "pending" | "accepted" | "declined";
      created_at: string;
      collection_name: string;
      collection_type: string;
      inviter_display_name: string | null;
      inviter_email: string | null;
    }>
  ).map((row) => ({
    id: row.id,
    collection_id: row.collection_id,
    inviter_id: "",
    invitee_id: "",
    status: row.status,
    created_at: row.created_at,
    collection: {
      name: row.collection_name,
      type: row.collection_type,
    },
    inviter: row.inviter_email
      ? {
          display_name: row.inviter_display_name,
          email: row.inviter_email,
        }
      : undefined,
  }));
}

/** Get ratings from all members for movies in a shared collection */
export async function getCollectionMemberRatings(
  collectionId: string
): Promise<
  Record<
    number,
    { user_id: string; display_name: string | null; rating: number | null }[]
  >
> {
  const supabase = await createClient();

  // Get members
  const { data: members } = await supabase
    .from("collection_members")
    .select("user_id, profile:profiles(display_name)")
    .eq("collection_id", collectionId);

  if (!members || members.length === 0) return {};

  // Get the collection owner too
  const { data: collection } = await supabase
    .from("collections")
    .select("user_id")
    .eq("id", collectionId)
    .single();

  const allUserIds = new Set<string>();
  if (collection) allUserIds.add(collection.user_id);
  members.forEach((m) => allUserIds.add(m.user_id));

  // Get collection movie IDs
  const { data: collMovies } = await supabase
    .from("collection_movies")
    .select("tmdb_movie_id")
    .eq("collection_id", collectionId);

  if (!collMovies || collMovies.length === 0) return {};

  const movieIds = collMovies.map((m) => m.tmdb_movie_id);
  const userIdArray = Array.from(allUserIds);

  // Get all user_movies for these movies + these users
  const { data: userMovies } = await supabase
    .from("user_movies")
    .select("tmdb_movie_id, user_id, personal_rating")
    .in("tmdb_movie_id", movieIds)
    .in("user_id", userIdArray);

  // Get profiles for all users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIdArray);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p.display_name])
  );

  // Build the result: movieId -> [{ user_id, display_name, rating }]
  const result: Record<
    number,
    { user_id: string; display_name: string | null; rating: number | null }[]
  > = {};

  for (const movieId of movieIds) {
    result[movieId] = userIdArray.map((uid) => {
      const userMovie = (userMovies || []).find(
        (um) => um.tmdb_movie_id === movieId && um.user_id === uid
      );
      return {
        user_id: uid,
        display_name: profileMap.get(uid) || null,
        rating: userMovie?.personal_rating ?? null,
      };
    });
  }

  return result;
}

/** Ensure the collection creator is also a member with owner role */
export async function ensureOwnerMember(collectionId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("collection_members").upsert(
    {
      collection_id: collectionId,
      user_id: user.id,
      role: "owner",
    },
    { onConflict: "collection_id,user_id" }
  );
}
