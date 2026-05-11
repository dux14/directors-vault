/* ============================================
 * Person Detail Client Component
 * Bio + filterable filmography grid
 * ============================================ */

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  type TMDBPerson,
  type TMDBPersonCredits,
  type TMDBMovie,
  getProfileUrl,
} from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import styles from "./person.module.css";

/* ---- SVG Icons ---- */
const IconChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
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

type FilterType = "all" | "cast" | "directing";

interface Props {
  person: TMDBPerson;
  credits: TMDBPersonCredits;
}

export default function PersonDetailClient({ person, credits }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFullBio, setShowFullBio] = useState(false);

  // Deduplicate movies by ID and sort by popularity
  const getFilteredMovies = (): (TMDBMovie & { role: string })[] => {
    const seen = new Set<number>();
    const movies: (TMDBMovie & { role: string })[] = [];

    if (filter === "all" || filter === "cast") {
      for (const movie of credits.cast) {
        if (!seen.has(movie.id) && movie.poster_path) {
          seen.add(movie.id);
          movies.push({ ...movie, role: movie.character });
        }
      }
    }

    if (filter === "all" || filter === "directing") {
      for (const movie of credits.crew) {
        if (!seen.has(movie.id) && movie.job === "Director" && movie.poster_path) {
          seen.add(movie.id);
          movies.push({ ...movie, role: "Director" });
        }
      }
    }

    return movies.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  };

  const filteredMovies = getFilteredMovies();
  const directorCount = credits.crew.filter((c) => c.job === "Director").length;
  const actorCount = credits.cast.length;

  const bioPreview = person.biography && person.biography.length > 300
    ? person.biography.slice(0, 300) + "..."
    : person.biography;

  return (
    <div className={styles.page}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className={`btn btn-ghost btn-icon ${styles.backBtn}`}
        id="back-button"
      >
        <IconChevronLeft />
      </button>

      <div className={`container ${styles.content}`}>
        {/* Hero */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.avatarWrapper}>
            <Image
              src={getProfileUrl(person.profile_path, "large")}
              alt={person.name}
              width={160}
              height={240}
              className={styles.avatar}
              unoptimized={!person.profile_path}
            />
          </div>

          <div className={styles.heroInfo}>
            <h1 className={styles.name}>{person.name}</h1>
            <p className={styles.department}>{person.known_for_department}</p>

            {person.birthday && (
              <p className={styles.meta}>
                {person.place_of_birth && `${person.place_of_birth} · `}
                {new Date(person.birthday).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}

            <div className={styles.stats}>
              {actorCount > 0 && (
                <span className={`tag ${filter === "cast" ? "active" : ""}`}>
                  <IconFilm /> {actorCount} como actor
                </span>
              )}
              {directorCount > 0 && (
                <span className={`tag ${filter === "directing" ? "active" : ""}`}>
                  <IconFilm /> {directorCount} como director
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Biography */}
        {person.biography && (
          <section className={styles.section}>
            <h2 className="section-title">Biografía</h2>
            <p className={styles.bio}>
              {showFullBio ? person.biography : bioPreview}
            </p>
            {person.biography.length > 300 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="btn btn-ghost btn-sm"
              >
                {showFullBio ? "Ver menos" : "Ver más"}
              </button>
            )}
          </section>
        )}

        {/* Filter tabs */}
        <section className={styles.section}>
          <div className={styles.filterRow}>
            <h2 className="section-title">Filmografía</h2>
            <div className={styles.filters}>
              <button
                onClick={() => setFilter("all")}
                className={`tag ${filter === "all" ? "active" : ""}`}
              >
                Todas ({actorCount + directorCount})
              </button>
              {actorCount > 0 && (
                <button
                  onClick={() => setFilter("cast")}
                  className={`tag ${filter === "cast" ? "active" : ""}`}
                >
                  Actor
                </button>
              )}
              {directorCount > 0 && (
                <button
                  onClick={() => setFilter("directing")}
                  className={`tag ${filter === "directing" ? "active" : ""}`}
                >
                  Director
                </button>
              )}
            </div>
          </div>

          {/* Movies Grid */}
          {filteredMovies.length > 0 ? (
            <div className="movie-grid">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  tmdbId={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  releaseDate={movie.release_date}
                  rating={movie.vote_average}
                  size="medium"
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Sin películas para este filtro</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
