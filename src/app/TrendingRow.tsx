/* ============================================
 * TrendingRow — Horizontal scrolling movie row
 * ============================================ */

"use client";

import MovieCard from "@/components/MovieCard";
import type { TMDBMovie } from "@/lib/tmdb";

interface TrendingRowProps {
  movies: TMDBMovie[];
}

export default function TrendingRow({ movies }: TrendingRowProps) {
  return (
    <div className="scroll-row">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          tmdbId={movie.id}
          title={movie.title}
          posterPath={movie.poster_path}
          releaseDate={movie.release_date}
          rating={movie.vote_average}
          size="small"
        />
      ))}
    </div>
  );
}
