/* ============================================
 * Friend Profile Page — View a friend's stats
 * ============================================ */

import { getProfileById, getFriendStats } from "@/lib/social-actions";
import { getMovieDetail, getTvDetail } from "@/lib/tmdb";
import { getServerTmdbLocale } from "@/lib/i18n/server";
import FriendProfileClient from "./FriendProfileClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileById(id);
  return {
    title: profile?.display_name || "Perfil",
    description: `Perfil de ${profile?.display_name || "usuario"}`,
  };
}

export default async function FriendProfilePage({ params }: Props) {
  const { id } = await params;
  const locale = await getServerTmdbLocale();

  const [profile, stats] = await Promise.all([
    getProfileById(id),
    getFriendStats(id),
  ]);

  if (!profile) notFound();

  // Fetch poster info for top items (movies and TV)
  const topItemDetails = await Promise.all(
    stats.topItems.slice(0, 6).map(async (m) => {
      try {
        if (m.media_type === "tv") {
          const detail = await getTvDetail(m.tmdb_id, locale);
          return {
            tmdb_id: m.tmdb_id,
            media_type: m.media_type,
            title: detail.name,
            poster_path: detail.poster_path,
            rating: m.personal_rating,
          };
        }
        const detail = await getMovieDetail(m.tmdb_id, locale);
        return {
          tmdb_id: m.tmdb_id,
          media_type: m.media_type,
          title: detail.title,
          poster_path: detail.poster_path,
          rating: m.personal_rating,
        };
      } catch {
        return {
          tmdb_id: m.tmdb_id,
          media_type: m.media_type,
          title: `Item #${m.tmdb_id}`,
          poster_path: null,
          rating: m.personal_rating,
        };
      }
    })
  );

  return (
    <FriendProfileClient
      profile={profile}
      stats={{ ...stats, topItemDetails }}
    />
  );
}
