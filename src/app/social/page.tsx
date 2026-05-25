/* ============================================
 * Social Page — Server Component
 * ============================================ */

import { getMyProfile, getFriendships } from "@/lib/social-actions";
import SocialClient from "./SocialClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social",
  description: "Conecta con amigos en Director's Vault",
};

export default async function SocialPage() {
  const [profile, friendships] = await Promise.all([
    getMyProfile().catch(() => null),
    getFriendships().catch(() => ({ friends: [], pendingReceived: [], pendingSent: [] })),
  ]);

  return (
    <SocialClient
      profile={profile}
      friends={friendships.friends}
      pendingReceived={friendships.pendingReceived}
      pendingSent={friendships.pendingSent}
    />
  );
}
