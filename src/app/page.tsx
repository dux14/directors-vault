/* ============================================
 * Home Page — Server data fetch → HomeClient
 * ============================================ */

import { getRankedMovies, getUserMovies } from "@/lib/actions";
import { getTrending, getNowPlaying, getTopRated } from "@/lib/tmdb";
import { getServerTmdbLocale } from "@/lib/i18n/server";
import { getRecommendationsForUser } from "@/lib/recommender";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const locale = await getServerTmdbLocale();
  const randomPage = Math.floor(Math.random() * 10) + 1;

  const [rankedMovies, allMovies, trending, nowPlaying, topRated] = await Promise.all([
    getRankedMovies().catch(() => []),
    getUserMovies().catch(() => []),
    getTrending("week", locale).catch(() => ({ results: [] })),
    getNowPlaying(1, locale).catch(() => ({ results: [] })),
    getTopRated(randomPage, locale).catch(() => ({ results: [] })),
  ]);

  // Recommendation: use top-rated movies (B or better)
  const topRatedIds = rankedMovies
    .filter((m) => m.personal_rating && m.personal_rating >= 5)
    .map((m) => m.tmdb_movie_id);
  const userMovieIds = new Set(allMovies.map((m) => m.tmdb_movie_id));
  const recommendations = await getRecommendationsForUser(
    topRatedIds, userMovieIds, locale
  ).catch(() => []);

  return (
    <HomeClient
      rankedMovies={rankedMovies}
      recommendations={recommendations}
      trending={trending.results}
      nowPlaying={nowPlaying.results}
      topRated={topRated.results}
    />
  );
}
