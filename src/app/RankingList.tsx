/* ============================================
 * RankingList — Ranked movie list with numbers
 * ============================================ */

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import type { UserMovie } from "@/lib/types";
import styles from "./RankingList.module.css";

interface RankingListProps {
  movies: UserMovie[];
}

export default function RankingList({ movies }: RankingListProps) {
  return (
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
            <Link
              href={`/movie/${movie.tmdb_movie_id}`}
              className={styles.item}
              id={`ranking-item-${rank}`}
            >
              {/* Rank */}
              <div
                className={`rank-number ${rank <= 3 ? "top-3" : ""}`}
              >
                {rank}
              </div>

              {/* Poster thumbnail */}
              <div className={styles.poster}>
                <Image
                  src={getPosterUrl(movie.movie_poster_path ?? null, "small")}
                  alt={movie.movie_title || "Movie"}
                  fill
                  sizes="56px"
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
                  <span
                    className={styles.ratingValue}
                    style={{ color: gradeColor }}
                  >
                    {grade}
                  </span>
                </div>
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
