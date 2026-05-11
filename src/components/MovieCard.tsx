/* ============================================
 * MovieCard — Poster card with hover overlay
 * Reusable across all pages
 * ============================================ */

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import type { MovieStatus } from "@/lib/types";
import styles from "./MovieCard.module.css";

interface MovieCardProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate?: string;
  rating?: number | null;
  userRating?: number | null;
  status?: MovieStatus | null;
  rank?: number;
  showRank?: boolean;
  size?: "small" | "medium" | "large";
}

export default function MovieCard({
  tmdbId,
  title,
  posterPath,
  releaseDate,
  rating,
  userRating,
  status,
  rank,
  showRank = false,
  size = "medium",
}: MovieCardProps) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const grade = userRating ? ratingToGrade(userRating) : null;
  const gradeColor = userRating ? getRatingColor(userRating) : null;

  return (
    <motion.div
      className={`${styles.card} ${styles[size]}`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showRank && rank !== undefined && (
        <div
          className={`${styles.rank} ${rank <= 3 ? styles.rankTop : ""}`}
        >
          #{rank}
        </div>
      )}

      <Link href={`/movie/${tmdbId}`} className={styles.link}>
        <div className={styles.posterWrapper}>
          <Image
            src={getPosterUrl(posterPath, size === "small" ? "small" : "medium")}
            alt={title}
            fill
            sizes={
              size === "small"
                ? "130px"
                : size === "medium"
                ? "185px"
                : "250px"
            }
            className={styles.poster}
            unoptimized={!posterPath}
          />

          {/* Status indicator dot */}
          {status && (
            <div className={`${styles.statusDot} ${styles[status]}`} />
          )}

          {/* Hover overlay */}
          <div className={styles.overlay}>
            <p className={styles.overlayTitle}>{title}</p>
            {year && <p className={styles.overlayYear}>{year}</p>}
            {grade && (
              <div
                className={styles.overlayRating}
                style={{ color: gradeColor || undefined }}
              >
                {grade}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
