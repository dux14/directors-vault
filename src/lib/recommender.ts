import {
  getMovieRecommendations,
  getTvRecommendations,
  movieToMediaItem,
  tvToMediaItem,
  type MediaItem,
} from "@/lib/tmdb";

interface ScoredMediaItem extends MediaItem {
  score: number;
}

export async function getRecommendationsForUser(
  ratedMovieIds: number[],
  ratedTvIds: number[],
  watchedIds: Set<string>,
  locale?: string,
  maxSources: number = 5
): Promise<MediaItem[]> {
  if (ratedMovieIds.length === 0 && ratedTvIds.length === 0) return [];

  const movieSources = ratedMovieIds.slice(0, maxSources);
  const tvSources = ratedTvIds.slice(0, maxSources);

  const allRecs = await Promise.all([
    ...movieSources.map((id) =>
      getMovieRecommendations(id, locale)
        .then((res) => res.results.map(movieToMediaItem))
        .catch(() => [] as MediaItem[])
    ),
    ...tvSources.map((id) =>
      getTvRecommendations(id, locale)
        .then((res) => res.results.map(tvToMediaItem))
        .catch(() => [] as MediaItem[])
    ),
  ]);

  const scoreMap = new Map<string, ScoredMediaItem>();

  for (const recs of allRecs) {
    for (const item of recs) {
      const key = `${item.id}-${item.mediaType}`;
      if (watchedIds.has(key)) continue;
      if (!item.posterPath) continue;

      const existing = scoreMap.get(key);
      if (existing) {
        existing.score += 1 + (item.voteAverage / 10);
      } else {
        scoreMap.set(key, {
          ...item,
          score: 1 + (item.voteAverage / 10),
        });
      }
    }
  }

  const sorted = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score);

  const movies = sorted.filter((i) => i.mediaType === "movie");
  const tvShows = sorted.filter((i) => i.mediaType === "tv");

  const balanced: ScoredMediaItem[] = [];
  const half = 15;
  const mi = Math.min(movies.length, half);
  const ti = Math.min(tvShows.length, half);
  for (let i = 0; i < Math.max(mi, ti); i++) {
    if (i < mi) balanced.push(movies[i]);
    if (i < ti) balanced.push(tvShows[i]);
  }
  const remaining = sorted.filter((i) => !balanced.includes(i));
  return [...balanced, ...remaining].slice(0, 60);
}
