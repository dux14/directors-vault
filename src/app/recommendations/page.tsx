/* ============================================
 * Recommendations Page
 * Personalized movie recommendations
 * ============================================ */

import { getRankedMovies, getUserMovies } from "@/lib/actions";
import { getServerTmdbLocale } from "@/lib/i18n/server";
import { getRecommendationsForUser } from "@/lib/recommender";
import RecommendationsClient from "./RecommendationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Para Ti",
  description: "Recomendaciones personalizadas basadas en tus películas favoritas",
};

export default async function RecommendationsPage() {
  const locale = await getServerTmdbLocale();

  const [rankedMovies, allMovies] = await Promise.all([
    getRankedMovies().catch(() => []),
    getUserMovies().catch(() => []),
  ]);

  // Get top-rated IDs split by media type (rating >= 5 = B or better)
  const topRated = rankedMovies.filter((m) => m.personal_rating && m.personal_rating >= 5);
  const topRatedMovieIds = topRated.filter((m) => m.media_type === "movie").map((m) => m.tmdb_id);
  const topRatedTvIds = topRated.filter((m) => m.media_type === "tv").map((m) => m.tmdb_id);

  // Build set of all user's item keys to exclude from recommendations
  const watchedIds = new Set(allMovies.map((m) => `${m.tmdb_id}-${m.media_type}`));

  // Get personalized recommendations
  const recommendations = await getRecommendationsForUser(
    topRatedMovieIds,
    topRatedTvIds,
    watchedIds,
    locale
  ).catch(() => []);

  return (
    <RecommendationsClient
      recommendations={recommendations}
      hasRatedMovies={topRated.length > 0}
    />
  );
}
