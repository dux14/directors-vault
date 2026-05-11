/* ============================================
 * Movie Detail Page
 * Full movie info + action buttons + rating
 * ============================================ */

import { getMovieDetail } from "@/lib/tmdb";
import { getUserMovieByTmdbId } from "@/lib/actions";
import { getServerTmdbLocale } from "@/lib/i18n/server";
import MovieDetailClient from "./MovieDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerTmdbLocale();
  try {
    const movie = await getMovieDetail(parseInt(id), locale);
    return {
      title: movie.title,
      description: movie.overview,
    };
  } catch {
    return { title: "Película" };
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movieId = parseInt(id);
  const locale = await getServerTmdbLocale();

  const [movie, userMovie] = await Promise.all([
    getMovieDetail(movieId, locale),
    getUserMovieByTmdbId(movieId).catch(() => null),
  ]);

  return <MovieDetailClient movie={movie} userMovie={userMovie} />;
}
