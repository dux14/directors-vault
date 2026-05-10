/* ============================================
 * Profile Page — User info and settings
 * ============================================ */

import { getCurrentUser, getUserMovies } from "@/lib/actions";
import ProfileClient from "./ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil",
  description: "Tu perfil en Director's Vault",
};

export default async function ProfilePage() {
  const [user, allMovies] = await Promise.all([
    getCurrentUser(),
    getUserMovies().catch(() => []),
  ]);

  const watched = allMovies.filter((m) => m.status === "watched");
  const watchlist = allMovies.filter((m) => m.status === "want_to_watch");
  const notInterested = allMovies.filter(
    (m) => m.status === "not_interested"
  );

  const avgRating =
    watched.filter((m) => m.personal_rating).length > 0
      ? watched
          .filter((m) => m.personal_rating)
          .reduce((sum, m) => sum + (m.personal_rating || 0), 0) /
        watched.filter((m) => m.personal_rating).length
      : 0;

  return (
    <ProfileClient
      user={user}
      stats={{
        watched: watched.length,
        watchlist: watchlist.length,
        notInterested: notInterested.length,
        avgRating,
      }}
    />
  );
}
