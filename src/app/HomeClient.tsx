/* ============================================
 * Home Client — Translatable wrapper for home page
 * ============================================ */

"use client";

import { useTranslation } from "@/lib/i18n/context";
import RankingList from "./RankingList";
import MovieRow from "@/components/MovieRow";
import type { UserMovie } from "@/lib/types";
import styles from "./page.module.css";

/* ---- SVG Icons ---- */
const IconSparkles = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", color: "var(--accent-primary)" }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const IconFlame = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: "inline", verticalAlign: "middle", color: "var(--accent-primary)" }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconFilm = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
    <line x1="17" y1="17" x2="22" y2="17" />
  </svg>
);

const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

interface TMDBResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
}

interface Props {
  rankedMovies: UserMovie[];
  recommendations: TMDBResult[];
  trending: TMDBResult[];
  nowPlaying: TMDBResult[];
  topRated: TMDBResult[];
}

export default function HomeClient({
  rankedMovies,
  recommendations,
  trending,
  nowPlaying,
  topRated,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="page">
      <div className="container">
        <div className={`page-header ${styles.header}`}>
          <h1>
            <span className={styles.accent}>{t("home.myRanking").split(" ")[0]}</span>{" "}
            {t("home.myRanking").split(" ").slice(1).join(" ")}
          </h1>
          <p>
            {rankedMovies.length > 0
              ? t("home.moviesRated", { count: String(rankedMovies.length) })
              : t("home.startRating")}
          </p>
        </div>

        {/* For You — Recommendations */}
        {recommendations.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title"><IconSparkles /> {t("home.forYou")}</h2>
            </div>
            <MovieRow movies={recommendations.slice(0, 12)} />
          </section>
        )}

        {/* Trending Weekly */}
        {trending.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title"><IconFlame /> {t("home.trending")}</h2>
            </div>
            <MovieRow movies={trending.slice(0, 12)} />
          </section>
        )}

        {nowPlaying.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title"><IconPlay /> {t("home.nowPlaying")}</h2>
            </div>
            <MovieRow movies={nowPlaying.slice(0, 12)} />
          </section>
        )}

        {topRated.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title"><IconTrophy /> {t("home.topRated")}</h2>
            </div>
            <MovieRow movies={topRated.slice(0, 12)} />
          </section>
        )}

        <section className="section">
          <div className="section-header">
            <h2 className="section-title"><IconStar /> {t("home.myTop")}</h2>
          </div>

          {rankedMovies.length > 0 ? (
            <RankingList movies={rankedMovies} />
          ) : (
            <div className="empty-state">
              <div className="icon"><IconFilm /></div>
              <h3>{t("home.emptyTitle")}</h3>
              <p>{t("home.emptyDesc")}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
