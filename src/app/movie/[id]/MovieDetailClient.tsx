/* ============================================
 * Movie Detail Client Component
 * Interactive UI with actions and rating
 * ============================================ */

"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  type TMDBMovieDetail,
  getPosterUrl,
  getBackdropUrl,
  getProfileUrl,
} from "@/lib/tmdb";
import { setMovieStatus, rateMovie, removeUserMovie } from "@/lib/actions";
import type { UserMovie, MovieStatus } from "@/lib/types";
import RatingSlider from "@/components/RatingSlider";
import MovieCard from "@/components/MovieCard";
import styles from "./movie.module.css";

interface Props {
  movie: TMDBMovieDetail;
  userMovie: UserMovie | null;
}

export default function MovieDetailClient({ movie, userMovie }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<MovieStatus | null>(
    userMovie?.status || null
  );
  const [currentRating, setCurrentRating] = useState<number>(
    userMovie?.personal_rating || 5
  );
  const [showRating, setShowRating] = useState(false);
  const [saving, setSaving] = useState(false);

  const director = movie.credits?.crew.find((c) => c.job === "Director");
  const cast = movie.credits?.cast.slice(0, 8) || [];
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  const handleStatusChange = async (status: MovieStatus) => {
    setSaving(true);
    try {
      await setMovieStatus(
        movie.id,
        status,
        movie.title,
        movie.poster_path,
        movie.release_date,
        movie.overview
      );
      setCurrentStatus(status);
      if (status === "watched") {
        setShowRating(true);
      }
    } catch (error) {
      console.error("Error setting status:", error);
    }
    setSaving(false);
  };

  const handleRatingSave = async () => {
    setSaving(true);
    try {
      await rateMovie(movie.id, currentRating);
      setShowRating(false);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Error saving rating:", error);
    }
    setSaving(false);
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await removeUserMovie(movie.id);
      setCurrentStatus(null);
      setShowRating(false);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Error removing movie:", error);
    }
    setSaving(false);
  };

  return (
    <div className={styles.page}>
      {/* Backdrop */}
      <div className={styles.backdrop}>
        <Image
          src={getBackdropUrl(movie.backdrop_path)}
          alt=""
          fill
          priority
          className={styles.backdropImg}
          unoptimized={!movie.backdrop_path}
        />
        <div className={styles.backdropGradient} />
      </div>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className={`btn btn-ghost btn-icon ${styles.backBtn}`}
        id="back-button"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div className={`container ${styles.content}`}>
        {/* Hero section */}
        <div className={styles.hero}>
          <motion.div
            className={styles.posterWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={getPosterUrl(movie.poster_path, "large")}
              alt={movie.title}
              width={200}
              height={300}
              className={styles.poster}
              priority
              unoptimized={!movie.poster_path}
            />
          </motion.div>

          <motion.div
            className={styles.heroInfo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className={styles.title}>{movie.title}</h1>
            {movie.tagline && (
              <p className={styles.tagline}>&quot;{movie.tagline}&quot;</p>
            )}
            <div className={styles.meta}>
              {year && <span>{year}</span>}
              {runtime && <span>{runtime}</span>}
              {movie.vote_average > 0 && (
                <span className={styles.tmdbRating}>
                  ⭐ {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            <div className={styles.genres}>
              {movie.genres.map((genre) => (
                <span key={genre.id} className="tag">
                  {genre.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Status badge */}
          {currentStatus && (
            <div className={styles.currentStatus}>
              <span
                className={`status-badge ${
                  currentStatus === "watched"
                    ? "watched"
                    : currentStatus === "want_to_watch"
                    ? "want-to-watch"
                    : "not-interested"
                }`}
              >
                {currentStatus === "watched"
                  ? "✓ Vista"
                  : currentStatus === "want_to_watch"
                  ? "⏳ Pendiente"
                  : "✕ No interesada"}
              </span>
              {userMovie?.personal_rating && (
                <span className="rating-badge">
                  ⭐ {userMovie.personal_rating.toFixed(1)}
                </span>
              )}
            </div>
          )}

          <div className={styles.actionBtns}>
            <button
              onClick={() => handleStatusChange("watched")}
              disabled={saving}
              className={`btn ${
                currentStatus === "watched" ? "btn-watched" : "btn-secondary"
              }`}
              id="btn-watched"
            >
              ✓ Vista
            </button>
            <button
              onClick={() => handleStatusChange("want_to_watch")}
              disabled={saving}
              className={`btn ${
                currentStatus === "want_to_watch"
                  ? "btn-watchlist"
                  : "btn-secondary"
              }`}
              id="btn-watchlist"
            >
              ⏳ Quiero Ver
            </button>
            <button
              onClick={() => handleStatusChange("not_interested")}
              disabled={saving}
              className={`btn ${
                currentStatus === "not_interested"
                  ? "btn-not-interested"
                  : "btn-secondary"
              }`}
              id="btn-not-interested"
            >
              ✕ No
            </button>
          </div>

          {/* Rate / Edit rating */}
          {currentStatus === "watched" && (
            <button
              onClick={() => setShowRating(true)}
              className="btn btn-primary btn-sm"
              id="btn-rate"
            >
              {userMovie?.personal_rating ? "Editar Rating" : "Calificar"}
            </button>
          )}

          {/* Remove button */}
          {currentStatus && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="btn btn-ghost btn-sm"
              id="btn-remove"
            >
              Quitar de mi lista
            </button>
          )}
        </motion.div>

        {/* Rating Modal */}
        <AnimatePresence>
          {showRating && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRating(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-handle" />
                <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                  Califica esta película
                </h3>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.875rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "1rem",
                  }}
                >
                  {movie.title}
                </p>
                <RatingSlider
                  value={currentRating}
                  onChange={setCurrentRating}
                />
                <div className={styles.ratingActions}>
                  <button
                    onClick={() => setShowRating(false)}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRatingSave}
                    disabled={saving}
                    className="btn btn-primary"
                    id="btn-save-rating"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview */}
        <section className={styles.section}>
          <h2 className="section-title">Sinopsis</h2>
          <p className={styles.overview}>{movie.overview || "Sin sinopsis disponible."}</p>
        </section>

        {/* Director */}
        {director && (
          <section className={styles.section}>
            <h2 className="section-title">Director</h2>
            <div className={styles.personChip}>
              <div className={styles.personAvatar}>
                <Image
                  src={getProfileUrl(director.profile_path, "small")}
                  alt={director.name}
                  width={40}
                  height={40}
                  className={styles.personImg}
                  unoptimized={!director.profile_path}
                />
              </div>
              <span>{director.name}</span>
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className={styles.section}>
            <h2 className="section-title">Reparto</h2>
            <div className="scroll-row">
              {cast.map((actor) => (
                <div key={actor.id} className={styles.castCard}>
                  <div className={styles.castAvatar}>
                    <Image
                      src={getProfileUrl(actor.profile_path, "medium")}
                      alt={actor.name}
                      fill
                      sizes="80px"
                      className={styles.personImg}
                      unoptimized={!actor.profile_path}
                    />
                  </div>
                  <p className={styles.castName}>{actor.name}</p>
                  <p className={styles.castChar}>{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {movie.recommendations?.results &&
          movie.recommendations.results.length > 0 && (
            <section className={styles.section}>
              <h2 className="section-title">Recomendadas</h2>
              <div className="scroll-row">
                {movie.recommendations.results.slice(0, 10).map((rec) => (
                  <div key={rec.id} style={{ width: 130 }}>
                    <MovieCard
                      tmdbId={rec.id}
                      title={rec.title}
                      posterPath={rec.poster_path}
                      releaseDate={rec.release_date}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
