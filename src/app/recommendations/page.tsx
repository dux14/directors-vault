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

  // Get top-rated movie IDs (rating >= 5 = B or better)
  const topRatedIds = rankedMovies
    .filter((m) => m.personal_rating && m.personal_rating >= 5)
    .map((m) => m.tmdb_movie_id);

  // Build set of all user's movie IDs to exclude
  const userMovieIds = new Set(allMovies.map((m) => m.tmdb_movie_id));

  // Get personalized recommendations
  const recommendations = await getRecommendationsForUser(
    topRatedIds,
    userMovieIds,
    locale
  ).catch(() => []);

  return (
    <RecommendationsClient
      recommendations={recommendations}
      hasRatedMovies={topRatedIds.length > 0}
    />
  );
}
