/* ============================================
 * MovieListRow — dense one-line movie row
 * Used by /search, /watchlist, /collections/[id] in list mode
 * ============================================ */

"use client";

import Image from "next/image";
import Link from "next/link";
import { getPosterUrl } from "@/lib/tmdb";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import type { MovieStatus } from "@/lib/types";
import styles from "./MovieListRow.module.css";

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface Props {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate?: string;
  userRating?: number | null;
  status?: MovieStatus | null;
  watched?: boolean;
}

export default function MovieListRow({
  tmdbId,
  title,
  posterPath,
  releaseDate,
  userRating,
  status,
  watched = false,
}: Props) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const grade = userRating ? ratingToGrade(userRating) : null;
  const gradeColor = userRating ? getRatingColor(userRating) : undefined;

  return (
    <Link href={`/movie/${tmdbId}`} className={styles.item}>
      <div className={styles.poster}>
        <Image
          src={getPosterUrl(posterPath, "small")}
          alt={title}
          fill
          sizes="48px"
          className={styles.posterImg}
          unoptimized={!posterPath}
          style={watched ? { opacity: 0.85 } : undefined}
        />
        {watched && (
          <div className={styles.watchedBadge} aria-label="watched" title="watched">
            <IconCheck />
          </div>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.title}>{title}</span>
        {year && <span className={styles.year}>{year}</span>}
      </div>

      <div className={styles.meta}>
        {grade && (
          <span className={styles.rating} style={{ color: gradeColor }}>
            {grade}
          </span>
        )}
        {status && <span className={`${styles.statusDot} ${styles[status]}`} />}
      </div>
    </Link>
  );
}
