/* ============================================
 * Recommendations Client Component
 * ============================================ */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/context";
import MovieCard from "@/components/MovieCard";
import type { MediaItem } from "@/lib/tmdb";
import styles from "./recommendations.module.css";

/* ---- SVG Icons ---- */
const IconSparkles = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const IconStar = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const PAGE_SIZE = 30;
const HALF = 15;

function balancedSlice(items: MediaItem[]): MediaItem[] {
  const movies = items.filter((i) => i.mediaType === "movie");
  const tvShows = items.filter((i) => i.mediaType === "tv");
  const result: MediaItem[] = [];
  const mi = Math.min(movies.length, HALF);
  const ti = Math.min(tvShows.length, HALF);
  for (let i = 0; i < Math.max(mi, ti); i++) {
    if (i < mi) result.push(movies[i]);
    if (i < ti) result.push(tvShows[i]);
  }
  return result;
}

interface Props {
  recommendations: MediaItem[];
  hasRatedMovies: boolean;
}

export default function RecommendationsClient({
  recommendations,
  hasRatedMovies,
}: Props) {
  const { t } = useTranslation();
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");
  const [showAll, setShowAll] = useState(false);

  const filteredRecommendations = mediaFilter === "all"
    ? balancedSlice(recommendations)
    : recommendations.filter((item) => item.mediaType === mediaFilter).slice(0, PAGE_SIZE);

  const visibleRecommendations = showAll
    ? filteredRecommendations
    : filteredRecommendations.slice(0, 20);

  const hasMore = filteredRecommendations.length > 20 && !showAll;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><IconSparkles /> {t("home.forYou")}</h1>
          <p>
            {hasRatedMovies
              ? recommendations.length > 0
                ? t("recommendations.subtitle", { count: recommendations.length })
                : t("recommendations.rateMore")
              : t("recommendations.startRating")}
          </p>
        </div>

        {recommendations.length > 0 ? (
          <>
            {/* Media type filter */}
            <div className={styles.filterToggle}>
              {(["all", "movie", "tv"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setMediaFilter(type); setShowAll(false); }}
                  className={`${styles.filterBtn} ${mediaFilter === type ? styles.filterBtnActive : ""}`}
                >
                  {t(type === "all" ? "filter.all" : type === "movie" ? "filter.movies" : "filter.series")}
                </button>
              ))}
            </div>

            <motion.div
              className="movie-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {visibleRecommendations.map((movie, index) => (
                <motion.div
                  key={`${movie.id}-${movie.mediaType}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <MovieCard
                    tmdbId={movie.id}
                    title={movie.displayTitle}
                    posterPath={movie.posterPath}
                    releaseDate={movie.displayDate}
                    rating={movie.voteAverage}
                    mediaType={movie.mediaType}
                    showBadge={true}
                  />
                </motion.div>
              ))}
            </motion.div>

            {hasMore && (
              <div className={styles.showMoreWrap}>
                <button
                  onClick={() => setShowAll(true)}
                  className="btn btn-ghost"
                >
                  {t("recommendations.showMore")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="icon"><IconStar /></div>
            <h3>{hasRatedMovies ? t("recommendations.emptyTitle") : t("recommendations.emptyNoRatings")}</h3>
            <p>
              {hasRatedMovies
                ? t("recommendations.emptyDesc")
                : t("recommendations.emptyNoRatingsDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
