/* ============================================
 * Movie Row — Horizontal scrollable movie strip
 * Reusable for trending, top rated, now playing, etc.
 * ============================================ */

"use client";

import MovieCard from "@/components/MovieCard";
import type { MediaType } from "@/lib/types";

interface MovieRowItem {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  mediaType?: MediaType;
}

interface MovieRowProps {
  movies: MovieRowItem[];
  size?: "small" | "medium";
  showBadge?: boolean;
}

export default function MovieRow({ movies, size = "small", showBadge = false }: MovieRowProps) {
  return (
    <div className="scroll-row">
      {movies.map((movie) => (
        <div key={`${movie.mediaType || "movie"}-${movie.id}`} style={{ width: size === "small" ? 130 : 160 }}>
          <MovieCard
            tmdbId={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            releaseDate={movie.release_date}
            rating={movie.vote_average}
            size={size}
            mediaType={movie.mediaType}
            showBadge={showBadge}
          />
        </div>
      ))}
    </div>
  );
}
