"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import { swapTierPosition } from "@/lib/actions";
import { useTranslation } from "@/lib/i18n/context";
import type { UserMovie } from "@/lib/types";
import styles from "./RankingList.module.css";

interface RankingListProps {
  movies: UserMovie[];
}

const IconArrowUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const IconArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function RankingList({ movies: initialMovies }: RankingListProps) {
  const { t } = useTranslation();
  const [movies, setMovies] = useState(initialMovies);
  const [reorderMode, setReorderMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isFirstInTier = (index: number) => {
    if (index === 0) return true;
    return movies[index].personal_rating !== movies[index - 1].personal_rating;
  };

  const isLastInTier = (index: number) => {
    if (index === movies.length - 1) return true;
    return movies[index].personal_rating !== movies[index + 1].personal_rating;
  };

  const handleSwap = (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= movies.length) return;

    // Optimistic update
    const newMovies = [...movies];
    [newMovies[index], newMovies[swapIndex]] = [newMovies[swapIndex], newMovies[index]];
    setMovies(newMovies);

    // Server sync
    startTransition(async () => {
      try {
        await swapTierPosition(movies[index].id, direction);
      } catch {
        setMovies(initialMovies); // Revert on error
      }
    });
  };

  return (
    <div>
      <div className={styles.header}>
        <button
          onClick={() => setReorderMode(!reorderMode)}
          className="btn btn-ghost btn-sm"
        >
          {reorderMode ? t("ranking.done") : t("ranking.reorder")}
        </button>
      </div>
      <div className={styles.list}>
        {movies.map((movie, index) => {
          const rank = index + 1;
          const year = movie.movie_release_date
            ? new Date(movie.movie_release_date).getFullYear()
            : null;
          const grade = ratingToGrade(movie.personal_rating);
          const gradeColor = getRatingColor(movie.personal_rating);

          return (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div className={styles.item}>
                {reorderMode ? (
                  <>
                    {/* Reorder arrows */}
                    <div className={styles.reorderControls}>
                      <button
                        onClick={() => handleSwap(index, "up")}
                        disabled={isFirstInTier(index) || isPending}
                        className={styles.arrowBtn}
                        aria-label="Move up"
                      >
                        <IconArrowUp />
                      </button>
                      <button
                        onClick={() => handleSwap(index, "down")}
                        disabled={isLastInTier(index) || isPending}
                        className={styles.arrowBtn}
                        aria-label="Move down"
                      >
                        <IconArrowDown />
                      </button>
                    </div>

                    {/* Poster thumbnail */}
                    <div className={styles.poster}>
                      <Image
                        src={getPosterUrl(movie.movie_poster_path ?? null, "small")}
                        alt={movie.movie_title || "Movie"}
                        fill
                        sizes="48px"
                        className={styles.posterImg}
                        unoptimized={!movie.movie_poster_path}
                      />
                    </div>

                    {/* Info */}
                    <div className={styles.info}>
                      <h3 className={styles.title}>
                        {movie.movie_title || `Movie #${movie.tmdb_movie_id}`}
                      </h3>
                      {year && <span className={styles.year}>{year}</span>}
                    </div>

                    {/* Grade badge */}
                    {grade && (
                      <div className={styles.rating}>
                        <span className={styles.ratingValue} style={{ color: gradeColor }}>
                          {grade}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={`/movie/${movie.tmdb_movie_id}`} className={styles.itemLink}>
                    {/* Rank */}
                    <div className={`rank-number ${rank <= 3 ? "top-3" : ""}`}>
                      {rank}
                    </div>

                    {/* Poster thumbnail */}
                    <div className={styles.poster}>
                      <Image
                        src={getPosterUrl(movie.movie_poster_path ?? null, "small")}
                        alt={movie.movie_title || "Movie"}
                        fill
                        sizes="48px"
                        className={styles.posterImg}
                        unoptimized={!movie.movie_poster_path}
                      />
                    </div>

                    {/* Info */}
                    <div className={styles.info}>
                      <h3 className={styles.title}>
                        {movie.movie_title || `Movie #${movie.tmdb_movie_id}`}
                      </h3>
                      {year && <span className={styles.year}>{year}</span>}
                    </div>

                    {/* User Rating — Letter Grade */}
                    {grade && (
                      <div className={styles.rating}>
                        <span className={styles.ratingValue} style={{ color: gradeColor }}>
                          {grade}
                        </span>
                      </div>
                    )}
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
