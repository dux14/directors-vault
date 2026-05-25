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

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}
