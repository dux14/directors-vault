/* ============================================
 * Movie Row — Horizontal scrollable movie strip
 * Reusable for trending, top rated, now playing, etc.
 * ============================================ */

"use client";

import { type TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

interface MovieRowMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
}

interface MovieRowProps {
  movies: MovieRowMovie[];
  size?: "small" | "medium";
}

export default function MovieRow({ movies, size = "small" }: MovieRowProps) {
  return (
    <div className="scroll-row">
      {movies.map((movie) => (
        <div key={movie.id} style={{ width: size === "small" ? 130 : 160 }}>
          <MovieCard
            tmdbId={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            releaseDate={movie.release_date}
            rating={movie.vote_average}
            size={size}
          />
        </div>
      ))}
    </div>
  );
}
