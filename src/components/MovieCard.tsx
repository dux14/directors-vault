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
import { useTranslation } from "@/lib/i18n/context";
import type { MediaType, MovieStatus } from "@/lib/types";
import MediaBadge from "./MediaBadge";
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
  watched?: boolean;
  mediaType?: MediaType;
  showBadge?: boolean;
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
  watched = false,
  mediaType = "movie",
  showBadge = false,
}: MovieCardProps) {
  const { t } = useTranslation();
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const isUpcoming = releaseDate ? new Date(releaseDate) > new Date() : false;
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

      {/* prefetch={false}: las grillas renderizan cientos de cards; el prefetch automático
          dispara un burst de requests RSC que excede el rate limit del WAF (300/60s) y quema cuota */}
      <Link href={mediaType === "tv" ? `/tv/${tmdbId}` : `/movie/${tmdbId}`} prefetch={false} className={styles.link}>
        <div className={styles.posterWrapper}>
          {showBadge && <MediaBadge type={mediaType} />}
          {isUpcoming && (
            <span className={styles.upcomingBadge}>{t("media.upcoming")}</span>
          )}
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
            style={watched ? { opacity: 0.85 } : undefined}
          />

          {watched && (
            <div className={styles.watchedBadge} aria-label="watched" title="watched">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

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
