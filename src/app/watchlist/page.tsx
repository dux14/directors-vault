/* ============================================
 * Watchlist Page — Movies marked "want to watch"
 * ============================================ */

import { getUserMovies } from "@/lib/actions";
import MovieCard from "@/components/MovieCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiero Ver",
  description: "Tu lista de películas pendientes",
};

export default async function WatchlistPage() {
  const movies = await getUserMovies("want_to_watch").catch(() => []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>⏳ Quiero Ver</h1>
          <p>
            {movies.length > 0
              ? `${movies.length} película${movies.length !== 1 ? "s" : ""} en tu lista`
              : "Tu lista de pendientes está vacía"}
          </p>
        </div>

        {movies.length > 0 ? (
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
          <div className="empty-state">
            <div className="icon">⏳</div>
            <h3>Nada pendiente</h3>
            <p>
              Busca películas y márcalas como &quot;Quiero Ver&quot; para
              agregarlas aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
