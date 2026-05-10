/* ============================================
 * Collection Detail Client
 * Shows movies in collection + add/remove
 * ============================================ */

"use client";

import { useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { removeMovieFromCollection } from "@/lib/actions";
import type { Collection, CollectionMovie } from "@/lib/types";
import styles from "./collectionDetail.module.css";

interface Props {
  collection: Collection;
  initialMovies: CollectionMovie[];
}

export default function CollectionDetailClient({
  collection,
  initialMovies,
}: Props) {
  const router = useRouter();

  return (
    <div className="page">
      <div className="container">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className={`btn btn-ghost btn-sm ${styles.backBtn}`}
        >
          ← Colecciones
        </button>

        <div className="page-header">
          <h1>{collection.name}</h1>
          {collection.description && <p>{collection.description}</p>}
          <span className="tag" style={{ marginTop: "var(--space-sm)" }}>
            {collection.type}
          </span>
        </div>

        {initialMovies.length > 0 ? (
          <div className="movie-grid">
            {initialMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                tmdbId={movie.tmdb_movie_id}
                title={movie.movie_title || `Movie #${movie.tmdb_movie_id}`}
                posterPath={movie.movie_poster_path || null}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🎬</div>
            <h3>Colección vacía</h3>
            <p>
              Busca películas y agrégalas a esta colección desde su
              página de detalle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
