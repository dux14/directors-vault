/* ============================================
 * Home Page — Server data fetch → HomeClient
 * ============================================ */

import { getRankedMovies, getUserMovies } from "@/lib/actions";
import {
  getTrending, getNowPlaying, getTopRated,
  getTrendingTv, getTvOnTheAir, getTopRatedTv,
  movieToMediaItem, tvToMediaItem,
} from "@/lib/tmdb";
import { getServerTmdbLocale } from "@/lib/i18n/server";
import { getRecommendationsForUser } from "@/lib/recommender";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const locale = await getServerTmdbLocale();
  const randomPage = Math.floor(Math.random() * 10) + 1;

  const [
    rankedMovies, allMovies,
    trendingMovies, trendingTv,
    nowPlaying, tvOnTheAir,
    topRatedMovies, topRatedTv,
  ] = await Promise.all([
    getRankedMovies().catch(() => []),
    getUserMovies().catch(() => []),
    getTrending("week", locale).catch(() => ({ results: [] })),
    getTrendingTv("week", locale).catch(() => ({ results: [] })),
    getNowPlaying(1, locale).catch(() => ({ results: [] })),
    getTvOnTheAir(1, locale).catch(() => ({ results: [] })),
    getTopRated(randomPage, locale).catch(() => ({ results: [] })),
    getTopRatedTv(randomPage, locale).catch(() => ({ results: [] })),
  ]);

  const topRatedMovieIds = rankedMovies
    .filter((m) => m.personal_rating && m.personal_rating >= 5 && m.media_type === "movie")
    .map((m) => m.tmdb_id);
  const topRatedTvIds = rankedMovies
    .filter((m) => m.personal_rating && m.personal_rating >= 5 && m.media_type === "tv")
    .map((m) => m.tmdb_id);
  const watchedIds = new Set(allMovies.map((m) => `${m.tmdb_id}-${m.media_type}`));

  const recommendations = await getRecommendationsForUser(
    topRatedMovieIds, topRatedTvIds, watchedIds, locale
  ).catch(() => []);

  const trendingItems = [
    ...trendingMovies.results.map(movieToMediaItem),
    ...trendingTv.results.map(tvToMediaItem),
  ].sort((a, b) => b.voteAverage - a.voteAverage);

  const nowPlayingItems = [
    ...nowPlaying.results.map(movieToMediaItem),
    ...tvOnTheAir.results.map(tvToMediaItem),
  ];

  const topRatedItems = [
    ...topRatedMovies.results.map(movieToMediaItem),
    ...topRatedTv.results.map(tvToMediaItem),
  ].sort((a, b) => b.voteAverage - a.voteAverage);

  return (
    <HomeClient
      rankedMovies={rankedMovies}
      recommendations={recommendations}
      trending={trendingItems}
      nowPlaying={nowPlayingItems}
      topRated={topRatedItems}
    />
  );
}
