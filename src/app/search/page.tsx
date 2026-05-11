/* ============================================
 * Search Page — TMDB search with tabs
 * Movies | Actors | Directors
 * ============================================ */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  searchMovies,
  searchPerson,
  getTrending,
  getProfileUrl,
  type TMDBMovie,
  type TMDBPersonSearchResult,
} from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import styles from "./search.module.css";

/* ---- SVG Icons ---- */
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconFlame = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const IconFilm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconSearchEmpty = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

type SearchTab = "movies" | "people";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("movies");
  const [movieResults, setMovieResults] = useState<TMDBMovie[]>([]);
  const [personResults, setPersonResults] = useState<TMDBPersonSearchResult[]>([]);
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load trending on mount
  useEffect(() => {
    getTrending("day")
      .then((data) => setTrending(data.results.slice(0, 20)))
      .catch(() => {});
  }, []);

  // Search handler
  const performSearch = useCallback(async (q: string, activeTab: SearchTab) => {
    if (!q.trim()) {
      setMovieResults([]);
      setPersonResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      if (activeTab === "movies") {
        const data = await searchMovies(q);
        setMovieResults(data.results);
      } else {
        const data = await searchPerson(q);
        setPersonResults(data.results);
      }
    } catch {
      setMovieResults([]);
      setPersonResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => performSearch(query, tab), 400);
    return () => clearTimeout(timer);
  }, [query, tab, performSearch]);

  const handleTabChange = (newTab: SearchTab) => {
    setTab(newTab);
    setMovieResults([]);
    setPersonResults([]);
    if (query.trim()) {
      setSearched(false); // Will trigger new search via effect
    }
  };

  return (
    <div className="page">
      <div className="container">
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder={tab === "movies" ? "Buscar película..." : "Buscar actor o director..."}
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
              <IconX />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => handleTabChange("movies")}
            className={`${styles.tab} ${tab === "movies" ? styles.tabActive : ""}`}
            id="tab-movies"
          >
            <IconFilm /> Películas
          </button>
          <button
            onClick={() => handleTabChange("people")}
            className={`${styles.tab} ${tab === "people" ? styles.tabActive : ""}`}
            id="tab-people"
          >
            <IconUser /> Personas
          </button>
        </div>

        {/* Results header */}
        {searched && !loading && (
          <div className={styles.resultsHeader}>
            <h2 className="section-title">
              {tab === "movies"
                ? `${movieResults.length} resultado${movieResults.length !== 1 ? "s" : ""}`
                : `${personResults.length} persona${personResults.length !== 1 ? "s" : ""}`}
            </h2>
          </div>
        )}

        {/* Trending (only when not searching and on movies tab) */}
        {!searched && tab === "movies" && trending.length > 0 && (
          <>
            <div className={styles.resultsHeader}>
              <h2 className="section-title"><IconFlame /> Popular hoy</h2>
            </div>
            <div className="movie-grid">
              {trending.map((movie) => (
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
          </>
        )}

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

        {/* Movie results */}
        {!loading && searched && tab === "movies" && movieResults.length > 0 && (
          <div className="movie-grid">
            {movieResults.map((movie) => (
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

        {/* Person results */}
        {!loading && searched && tab === "people" && personResults.length > 0 && (
          <div className={styles.personGrid}>
            {personResults.map((person) => (
              <Link
                key={person.id}
                href={`/person/${person.id}`}
                className={styles.personCard}
              >
                <div className={styles.personAvatar}>
                  <Image
                    src={getProfileUrl(person.profile_path, "medium")}
                    alt={person.name}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                    unoptimized={!person.profile_path}
                  />
                </div>
                <div className={styles.personInfo}>
                  <h3 className={styles.personName}>{person.name}</h3>
                  <p className={styles.personDept}>{person.known_for_department}</p>
                  {person.known_for && person.known_for.length > 0 && (
                    <p className={styles.personKnownFor}>
                      {person.known_for
                        .slice(0, 3)
                        .map((m) => m.title)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && searched && (
          (tab === "movies" && movieResults.length === 0) ||
          (tab === "people" && personResults.length === 0)
        ) && (
          <div className="empty-state">
            <div className="icon"><IconSearchEmpty /></div>
            <h3>Sin resultados</h3>
            <p>No encontramos {tab === "movies" ? "películas" : "personas"} para &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
