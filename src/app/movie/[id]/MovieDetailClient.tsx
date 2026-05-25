/* ============================================
 * Movie Detail Client Component
 * Interactive UI with actions and rating
 * ============================================ */

"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  type TMDBMovieDetail,
  getPosterUrl,
  getBackdropUrl,
  getProfileUrl,
} from "@/lib/tmdb";
import {
  setMovieStatus,
  rateMovie,
  removeUserMovie,
  updateWatchCount,
  addMovieToCollection,
  getUserCollectionsForMovie,
  createCollection,
} from "@/lib/actions";
import { ratingToGrade, getRatingColor, getRatingDef } from "@/lib/ratings";
import { useTranslation } from "@/lib/i18n/context";
import type { UserMovie, MovieStatus, Collection } from "@/lib/types";
import RatingPicker from "@/components/RatingPicker";
import MovieCard from "@/components/MovieCard";
import styles from "./movie.module.css";

/* ---- SVG Icon Components ---- */
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconMinus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface Props {
  movie: TMDBMovieDetail;
  userMovie: UserMovie | null;
}

export default function MovieDetailClient({ movie, userMovie }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t, tmdbLocale, country } = useTranslation();
  const [currentStatus, setCurrentStatus] = useState<MovieStatus | null>(
    userMovie?.status || null
  );
  const [currentRating, setCurrentRating] = useState<number | null>(
    userMovie?.personal_rating ?? null
  );
  const [watchCount, setWatchCount] = useState<number>(
    userMovie?.watch_count ?? 0
  );
  const [showRating, setShowRating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [collections, setCollections] = useState<(Collection & { hasMovie: boolean })[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  const director = movie.credits?.crew.find((c) => c.job === "Director");
  const cast = movie.credits?.cast.slice(0, 8) || [];
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const isUpcoming = movie.release_date
    ? new Date(movie.release_date) > new Date()
    : false;
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;
  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const watchProviders = movie["watch/providers"]?.results[country];
  const streamingProviders = watchProviders?.flatrate || watchProviders?.rent || watchProviders?.buy || [];

  const handleStatusChange = async (status: MovieStatus) => {
    setSaving(true);
    try {
      await setMovieStatus(
        movie.id,
        "movie",
        status,
        movie.title,
        movie.poster_path,
        movie.release_date,
        movie.overview
      );
      setCurrentStatus(status);
      if (status === "watched") {
        setShowRating(true);
        if (watchCount === 0) setWatchCount(1);
      }
    } catch (error) {
      console.error("Error setting status:", error);
    }
    setSaving(false);
  };

  const handleRatingSave = async () => {
    if (currentRating === null) return;
    setSaving(true);
    try {
      await rateMovie(movie.id, "movie", currentRating);
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
      await removeUserMovie(movie.id, "movie");
      setCurrentStatus(null);
      setCurrentRating(null);
      setWatchCount(0);
      setShowRating(false);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Error removing movie:", error);
    }
    setSaving(false);
  };

  const handleWatchCountChange = async (delta: number) => {
    const newCount = Math.max(0, watchCount + delta);
    setWatchCount(newCount);
    try {
      await updateWatchCount(movie.id, "movie", newCount);
    } catch (error) {
      console.error("Error updating watch count:", error);
      setWatchCount(watchCount); // Revert on error
    }
  };

  const ratingDef = getRatingDef(userMovie?.personal_rating ?? null);

  const handleOpenCollections = async () => {
    setLoadingCollections(true);
    setShowCollections(true);
    try {
      const data = await getUserCollectionsForMovie(movie.id, "movie");
      setCollections(data);
    } catch (err) {
      console.error("Error loading collections:", err);
    }
    setLoadingCollections(false);
  };

  const handleAddToCollection = async (collectionId: string) => {
    try {
      await addMovieToCollection(collectionId, movie.id, "movie", movie.title, movie.poster_path);
      setCollections((prev) =>
        prev.map((c) => c.id === collectionId ? { ...c, hasMovie: true } : c)
      );
    } catch (err) {
      console.error("Error adding to collection:", err);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);
    try {
      const newCol = await createCollection(newCollectionName.trim(), "custom");
      await addMovieToCollection(newCol.id, movie.id, "movie", movie.title, movie.poster_path);
      setCollections((prev) => [...prev, { ...newCol, hasMovie: true }]);
      setShowCollections(false);
      setNewCollectionName("");
      setIsCreating(false);
    } catch (err) {
      console.error("Error creating collection:", err);
    }
    setCreatingCollection(false);
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
              {isUpcoming && (
                <span className={styles.upcomingBadge}>{t("media.upcoming")}</span>
              )}
              {movie.vote_average > 0 && (
                <span className={styles.tmdbRating}>
                  <IconStar /> {movie.vote_average.toFixed(1)}
                </span>
              )}
              {trailer && (
                <a
                  href={`https://youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.trailerBtn}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {t("movie.trailer")}
                </a>
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
                {currentStatus === "watched" ? (
                  <><IconCheck /> {t("movie.watched")}</>
                ) : currentStatus === "want_to_watch" ? (
                  <><IconClock /> {t("movie.pending")}</>
                ) : (
                  <><IconX /> {t("movie.notInterestedStatus")}</>
                )}
              </span>
              {ratingDef && (
                <span
                  className="rating-badge"
                  style={{ color: ratingDef.color, borderColor: ratingDef.color }}
                >
                  {ratingDef.grade}
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
              <IconCheck /> {t("movie.watched")}
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
              <IconClock /> {t("movie.wantToWatch")}
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
              <IconX /> {t("movie.notInterested")}
            </button>
          </div>

          {/* Rate / Edit rating */}
          {currentStatus === "watched" && (
            <button
              onClick={() => setShowRating(true)}
              className="btn btn-primary btn-sm"
              id="btn-rate"
            >
              {userMovie?.personal_rating ? (
                <><IconEdit /> {t("movie.editRating")}</>
              ) : (
                <><IconStar /> {t("movie.rate")}</>
              )}
            </button>
          )}

          {/* Watch count */}
          {currentStatus === "watched" && (
            <div className={styles.watchCount}>
              <span className={styles.watchCountLabel}>
                <IconEye /> {t("movie.watchedCount", { count: watchCount, unit: watchCount === 1 ? t("movie.time") : t("movie.times") })}
              </span>
              <div className={styles.watchCountControls}>
                <button
                  onClick={() => handleWatchCountChange(-1)}
                  disabled={watchCount <= 0}
                  className="btn btn-ghost btn-icon btn-sm"
                  id="btn-watch-minus"
                >
                  <IconMinus />
                </button>
                <button
                  onClick={() => handleWatchCountChange(1)}
                  className="btn btn-ghost btn-icon btn-sm"
                  id="btn-watch-plus"
                >
                  <IconPlus />
                </button>
              </div>
            </div>
          )}

          {/* Remove button */}
          {currentStatus && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="btn btn-ghost btn-sm"
              id="btn-remove"
            >
              <IconTrash /> {t("movie.removeFromList")}
            </button>
          )}

          {/* Add to Collection */}
          <button
            onClick={handleOpenCollections}
            className="btn btn-secondary btn-sm"
            id="btn-add-to-collection"
          >
            <IconPlus /> {t("movie.addToCollection")}
          </button>
        </motion.div>

        {/* Collection Picker Modal */}
        <AnimatePresence>
          {showCollections && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
              setShowCollections(false);
              setCollectionSearch("");
              setIsCreating(false);
              setNewCollectionName("");
            }}
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
                <h3 style={{ marginBottom: "var(--space-sm)" }}>
                  {t("movie.selectCollection")}
                </h3>

                {/* Search + Create toggle row */}
                <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
                  <input
                    type="text"
                    placeholder={t("movie.searchCollections")}
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                    autoFocus={typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches}
                    style={{
                      flex: 1,
                      padding: "var(--space-sm) var(--space-md)",
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                    }}
                  />
                  <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="btn btn-primary btn-icon btn-sm"
                    aria-label={t("movie.createCollection")}
                  >
                    <IconPlus />
                  </button>
                </div>

                {/* Inline create form */}
                {isCreating && (
                  <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
                    <input
                      type="text"
                      placeholder={t("movie.newCollectionName")}
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateAndAdd(); }}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "var(--space-sm) var(--space-md)",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "0.875rem",
                      }}
                    />
                    <button
                      onClick={handleCreateAndAdd}
                      disabled={creatingCollection || !newCollectionName.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      {creatingCollection ? t("movie.creating") : t("movie.createCollection")}
                    </button>
                  </div>
                )}

                {/* Collection list with scroll */}
                {loadingCollections ? (
                  <p style={{ textAlign: "center", opacity: 0.6 }}>...</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                    {collections
                      .filter((col) => col.name.toLowerCase().includes(collectionSearch.toLowerCase()))
                      .map((col) => (
                        <button
                          key={col.id}
                          disabled={col.hasMovie}
                          onClick={() => handleAddToCollection(col.id)}
                          className={`btn ${col.hasMovie ? "btn-ghost" : "btn-secondary"}`}
                          style={{ justifyContent: "space-between", width: "100%" }}
                        >
                          <span>{col.name}</span>
                          {col.hasMovie && (
                            <span style={{ color: "var(--accent-primary)", fontSize: "0.85em" }}>
                              <IconCheck /> {t("movie.added")}
                            </span>
                          )}
                        </button>
                      ))}
                    {collections.length === 0 && !collectionSearch && !isCreating && (
                      <p style={{ textAlign: "center", opacity: 0.6 }}>
                        {t("movie.noCollections")}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  {t("movie.rateTitle")}
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
                <RatingPicker
                  value={currentRating}
                  onChange={setCurrentRating}
                />
                <div className={styles.ratingActions}>
                  <button
                    onClick={() => setShowRating(false)}
                    className="btn btn-ghost"
                  >
                    {t("movie.cancel")}
                  </button>
                  <button
                    onClick={handleRatingSave}
                    disabled={saving || currentRating === null}
                    className="btn btn-primary"
                    id="btn-save-rating"
                  >
                    {saving ? t("movie.saving") : t("movie.save")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview */}
        <section className={styles.section}>
          <h2 className="section-title">{t("movie.synopsis")}</h2>
          <p className={styles.overview}>{movie.overview || t("movie.noSynopsis")}</p>
        </section>

        {/* Streaming Providers */}
        <section className={styles.section}>
          <h2 className="section-title">{t("movie.whereToWatch")}</h2>
          {streamingProviders.length > 0 ? (
            <>
              <div className={styles.providers}>
                {streamingProviders.map((provider) => (
                  <div key={provider.provider_id} className={styles.providerChip}>
                    <Image
                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      width={32}
                      height={32}
                      className={styles.providerLogo}
                    />
                    <span>{provider.provider_name}</span>
                  </div>
                ))}
              </div>
              {watchProviders?.link && (
                <a
                  href={watchProviders.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.tmdbLink}
                >
                  {t("movie.viewOnTmdb")}
                </a>
              )}
            </>
          ) : (
            <p className={styles.noProviders}>{t("movie.notAvailableRegion")}</p>
          )}
        </section>

        {/* Director */}
        {director && (
          <section className={styles.section}>
            <h2 className="section-title">{t("movie.director")}</h2>
            <Link href={`/person/${director.id}`} className={styles.personChip}>
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
            </Link>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className={styles.section}>
            <h2 className="section-title">{t("movie.cast")}</h2>
            <div className="scroll-row">
              {cast.map((actor) => (
                <Link key={actor.id} href={`/person/${actor.id}`} className={styles.castCard}>
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
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {movie.recommendations?.results &&
          movie.recommendations.results.length > 0 && (
            <section className={styles.section}>
              <h2 className="section-title">{t("movie.recommended")}</h2>
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
