/* ============================================
 * Search Page — TMDB movie search
 * ============================================ */

"use client";

import { useState, useEffect, useCallback } from "react";
import { searchMovies, getTrending, type TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import styles from "./search.module.css";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load trending on mount
  useEffect(() => {
    getTrending("day")
      .then((data) => setTrending(data.results.slice(0, 20)))
      .catch(() => {});
  }, []);

  // Debounced search
  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchMovies(q);
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const displayMovies = searched ? results : trending;
  const title = searched
    ? `${results.length} resultado${results.length !== 1 ? "s" : ""}`
    : "🔥 Popular hoy";

  return (
    <div className="page">
      <div className="container">
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar película..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`input ${styles.searchInput}`}
            autoFocus
            id="search-input"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className={styles.clearBtn}
              id="clear-search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results header */}
        <div className={styles.resultsHeader}>
          <h2 className="section-title">{title}</h2>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="movie-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{ width: "100%", aspectRatio: "2/3" }} />
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && displayMovies.length > 0 && (
          <div className="movie-grid">
            {displayMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                tmdbId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date}
                rating={movie.vote_average}
              />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>Sin resultados</h3>
            <p>No encontramos películas para &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
