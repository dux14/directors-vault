/* ============================================
 * Recommendation Engine
 * Combines TMDB recommendations from user's top-rated movies
 * ============================================ */

import { getMovieRecommendations, type TMDBMovie } from "@/lib/tmdb";

interface ScoredMovie extends TMDBMovie {
  score: number;
}

/**
 * Get recommendations based on a user's highest-rated movies.
 * Calls /movie/{id}/recommendations for each source movie,
 * combines results, deduplicates, and scores by frequency.
 */
export async function getRecommendationsForUser(
  ratedMovieIds: number[],
  watchedMovieIds: Set<number>,
  locale?: string,
  maxSources: number = 5
): Promise<TMDBMovie[]> {
  if (ratedMovieIds.length === 0) return [];

  // Take up to maxSources best-rated movies
  const sourceIds = ratedMovieIds.slice(0, maxSources);

  // Fetch recommendations for each source in parallel
  const allRecs = await Promise.all(
    sourceIds.map((id) =>
      getMovieRecommendations(id, locale)
        .then((res) => res.results)
        .catch(() => [] as TMDBMovie[])
    )
  );

  // Score movies by how many times they appear (frequency scoring)
  const scoreMap = new Map<number, ScoredMovie>();

  for (const recs of allRecs) {
    for (const movie of recs) {
      // Skip movies the user has already watched or has in their list
      if (watchedMovieIds.has(movie.id)) continue;
      // Skip movies without posters
      if (!movie.poster_path) continue;

      const existing = scoreMap.get(movie.id);
      if (existing) {
        existing.score += 1 + (movie.vote_average / 10);
      } else {
        scoreMap.set(movie.id, {
          ...movie,
          score: 1 + (movie.vote_average / 10),
        });
      }
    }
  }

  // Sort by score (highest first), then by popularity
  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score || b.popularity - a.popularity)
    .slice(0, 20);
}

/**
 * Get recommendations from a manual selection of movies.
 */
export async function getRecommendationsFromSelection(
  movieIds: number[],
  watchedMovieIds: Set<number>,
  locale?: string
): Promise<TMDBMovie[]> {
  return getRecommendationsForUser(movieIds, watchedMovieIds, locale, movieIds.length);
}
