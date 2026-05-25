/* ============================================
 * Social Actions (Server Actions)
 * Friend system + shared collections
 * ============================================ */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  UserPublicProfile,
  Friendship,
  FriendshipStatus,
} from "@/lib/types";

// ---- User Profiles ----

/** Get the current user's public profile */
export async function getMyProfile(): Promise<UserPublicProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as UserPublicProfile | null;
}

/** Update display name */
export async function updateDisplayName(name: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("user_profiles")
    .update({ display_name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/social");
}

/** Toggle profile visibility */
export async function toggleProfileVisibility(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const profile = await getMyProfile();
  if (!profile) throw new Error("Profile not found");

  const newVisibility = !profile.is_public;
  await supabase
    .from("user_profiles")
    .update({ is_public: newVisibility, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/social");
  return newVisibility;
}

/** Search for a user by email */
export async function searchUserByEmail(
  email: string
): Promise<UserPublicProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .ilike("email", email.trim())
    .neq("id", user.id) // Don't find yourself
    .maybeSingle();

  if (error) {
    console.error("searchUserByEmail error:", error.message);
    return null;
  }
  return data as UserPublicProfile | null;
}

/** Search for a user by friend code (prefix match — we show only 8 chars) */
export async function searchUserByFriendCode(
  code: string
): Promise<UserPublicProfile | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const trimmed = code.trim().toLowerCase();
    if (trimmed.length < 4) return null; // Too short to search

    // Prefix match may return multiple rows — use .limit(1) instead of .maybeSingle()
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .ilike("friend_code", `${trimmed}%`)
      .neq("id", user.id)
      .limit(1);

    if (error) {
      console.error("searchUserByFriendCode error:", error.message);
      return null;
    }
    return (data && data.length > 0 ? data[0] : null) as UserPublicProfile | null;
  } catch (err) {
    console.error("searchUserByFriendCode unexpected error:", err);
    return null;
  }
}

/** Get a user's public profile by ID */
export async function getProfileById(
  profileId: string
): Promise<UserPublicProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error) {
      console.error("getProfileById error:", error.message);
      return null;
    }
    return data as UserPublicProfile | null;
  } catch (err) {
    console.error("getProfileById unexpected error:", err);
    return null;
  }
}

// ---- Friendships ----

/** Send a friend request */
export async function sendFriendRequest(addresseeId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (user.id === addresseeId) throw new Error("Cannot add yourself");

  // Check if friendship already exists (either direction)
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") throw new Error("Already friends");
    if (existing.status === "pending") throw new Error("Request already pending");
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: addresseeId,
    status: "pending",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/social");
}

/** Accept a friend request */
export async function respondToFriendRequest(
  friendshipId: string,
  accept: boolean
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const newStatus: FriendshipStatus = accept ? "accepted" : "rejected";

  const { error } = await supabase
    .from("friendships")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", friendshipId)
    .eq("addressee_id", user.id); // Only addressee can respond

  if (error) throw new Error(error.message);
  revalidatePath("/social");
}

/** Remove a friend */
export async function removeFriend(friendshipId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) throw new Error(error.message);
  revalidatePath("/social");
}

/** Get all friendships for current user */
export async function getFriendships(): Promise<{
  friends: Friendship[];
  pendingReceived: Friendship[];
  pendingSent: Friendship[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { friends: [], pendingReceived: [], pendingSent: [] };

  const { data: allFriendships } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (!allFriendships) return { friends: [], pendingReceived: [], pendingSent: [] };

  // Get all relevant profile IDs
  const profileIds = new Set<string>();
  for (const f of allFriendships) {
    profileIds.add(f.requester_id === user.id ? f.addressee_id : f.requester_id);
  }

  // Fetch profiles
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("*")
    .in("id", Array.from(profileIds));

  const profileMap = new Map<string, UserPublicProfile>();
  for (const p of profiles || []) {
    profileMap.set(p.id, p as UserPublicProfile);
  }

  // Enrich and categorize
  const enriched = allFriendships.map((f) => ({
    ...f,
    profile: profileMap.get(
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    ),
  })) as Friendship[];

  return {
    friends: enriched.filter((f) => f.status === "accepted"),
    pendingReceived: enriched.filter(
      (f) => f.status === "pending" && f.addressee_id === user.id
    ),
    pendingSent: enriched.filter(
      (f) => f.status === "pending" && f.requester_id === user.id
    ),
  };
}

/** Get a friend's movie stats */
export async function getFriendStats(friendId: string): Promise<{
  watched: number;
  avgRating: number;
  topItems: { tmdb_id: number; media_type: string; personal_rating: number }[];
}> {
  const supabase = await createClient();

  const { data: movies } = await supabase
    .from("user_movies")
    .select("tmdb_id, media_type, status, personal_rating")
    .eq("user_id", friendId)
    .eq("status", "watched");

  if (!movies) return { watched: 0, avgRating: 0, topItems: [] };

  const rated = movies.filter((m) => m.personal_rating);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, m) => sum + (m.personal_rating || 0), 0) / rated.length
    : 0;

  const topItems = rated
    .sort((a, b) => (b.personal_rating || 0) - (a.personal_rating || 0))
    .slice(0, 10);

  return { watched: movies.length, avgRating, topItems };
}
