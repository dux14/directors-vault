/* ============================================
 * Watchlist Client — grid/list toggle wrapper
 * ============================================ */

"use client";

import MovieCard from "@/components/MovieCard";
import MovieListRow from "@/components/MovieListRow";
import ViewToggle from "@/components/ViewToggle";
import { useView } from "@/lib/view/client";
import type { UserMovie } from "@/lib/types";
import type { ViewMode } from "@/lib/view/types";

const IconClockEmpty = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface Props {
  movies: UserMovie[];
  initialView: ViewMode;
}

export default function WatchlistClient({ movies, initialView }: Props) {
  const [view, setView] = useView(initialView);

  if (movies.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon"><IconClockEmpty /></div>
        <h3>Nada pendiente</h3>
        <p>
          Busca películas y márcalas como &quot;Quiero Ver&quot; para
          agregarlas aquí.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-md)" }}>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {view === "grid" ? (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              tmdbId={movie.tmdb_movie_id}
              title={movie.movie_title || `Movie #${movie.tmdb_movie_id}`}
              posterPath={movie.movie_poster_path || null}
              releaseDate={movie.movie_release_date}
              status={movie.status}
            />
          ))}
        </div>
      ) : (
        <div className="movie-list">
          {movies.map((movie) => (
            <MovieListRow
              key={movie.id}
              tmdbId={movie.tmdb_movie_id}
              title={movie.movie_title || `Movie #${movie.tmdb_movie_id}`}
              posterPath={movie.movie_poster_path || null}
              releaseDate={movie.movie_release_date}
              status={movie.status}
            />
          ))}
        </div>
      )}
    </>
  );
}
