/* ============================================
 * Person Detail Client Component
 * Bio + filterable filmography grid + export
 * ============================================ */

"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  type TMDBPerson,
  type TMDBPersonCredits,
  type TMDBMovie,
  getProfileUrl,
} from "@/lib/tmdb";
import { createCollectionWithMovies } from "@/lib/actions";
import { useTranslation } from "@/lib/i18n/context";
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

const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

type FilterType = "all" | "cast" | "directing";

interface Props {
  person: TMDBPerson;
  credits: TMDBPersonCredits;
}

export default function PersonDetailClient({ person, credits }: Props) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFullBio, setShowFullBio] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

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

  const dateLocale = locale === "en" ? "en-US" : "es-ES";

  const handleExportCollection = async () => {
    setExporting(true);
    try {
      const collectionType = filter === "directing" ? "director" : filter === "cast" ? "actor" : (directorCount > 0 ? "director" : "actor");
      const moviesToExport = filteredMovies.map((m) => ({
        tmdb_movie_id: m.id,
        movie_title: m.title,
        movie_poster_path: m.poster_path,
      }));
      await createCollectionWithMovies(person.name, collectionType, moviesToExport);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Export error:", error);
    }
    setExporting(false);
  };

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
                {new Date(person.birthday).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}

            <div className={styles.stats}>
              {actorCount > 0 && (
                <span className={`tag ${filter === "cast" ? "active" : ""}`}>
                  <IconFilm /> {actorCount} {t("person.asActorCount")}
                </span>
              )}
              {directorCount > 0 && (
                <span className={`tag ${filter === "directing" ? "active" : ""}`}>
                  <IconFilm /> {directorCount} {t("person.asDirectorCount")}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Biography */}
        {person.biography && (
          <section className={styles.section}>
            <h2 className="section-title">{t("person.biography")}</h2>
            <p className={styles.bio}>
              {showFullBio ? person.biography : bioPreview}
            </p>
            {person.biography.length > 300 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="btn btn-ghost btn-sm"
              >
                {showFullBio ? t("person.showLess") : t("person.showMore")}
              </button>
            )}
          </section>
        )}

        {/* Filter tabs */}
        <section className={styles.section}>
          <div className={styles.filterRow}>
            <h2 className="section-title">{t("person.filmography")}</h2>
            <div className={styles.filters}>
              <button
                onClick={() => setFilter("all")}
                className={`tag ${filter === "all" ? "active" : ""}`}
              >
                {t("person.all")} ({actorCount + directorCount})
              </button>
              {actorCount > 0 && (
                <button
                  onClick={() => setFilter("cast")}
                  className={`tag ${filter === "cast" ? "active" : ""}`}
                >
                  {t("person.asActor")}
                </button>
              )}
              {directorCount > 0 && (
                <button
                  onClick={() => setFilter("directing")}
                  className={`tag ${filter === "directing" ? "active" : ""}`}
                >
                  {t("person.asDirector")}
                </button>
              )}
            </div>
          </div>

          {/* Export button */}
          {filteredMovies.length > 0 && (
            <button
              onClick={handleExportCollection}
              disabled={exporting}
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: "var(--space-md)" }}
              id="export-collection-btn"
            >
              <IconExport />
              {exporting ? t("person.exporting") : exportSuccess ? t("person.exportSuccess") : t("person.exportCollection")}
            </button>
          )}

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
              <h3>{t("person.noMovies")}</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
