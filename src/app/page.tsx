/* ============================================
 * Home Page — Personal Movie Ranking
 * Shows watched movies sorted by personal rating
 * ============================================ */

import { getRankedMovies } from "@/lib/actions";
import { getTrending } from "@/lib/tmdb";
import RankingList from "./RankingList";
import TrendingRow from "./TrendingRow";
import styles from "./page.module.css";

/* ---- SVG Icons ---- */
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

export default async function HomePage() {
  const [rankedMovies, trending] = await Promise.all([
    getRankedMovies().catch(() => []),
    getTrending("week").catch(() => ({ results: [] })),
  ]);

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className={`page-header ${styles.header}`}>
          <h1>
            <span className={styles.accent}>Mi</span> Ranking
          </h1>
          <p>
            {rankedMovies.length > 0
              ? `${rankedMovies.length} películas calificadas`
              : "Empieza a calificar películas para ver tu ranking"}
          </p>
        </div>

        {/* Trending Discovery */}
        {trending.results.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title"><IconFlame /> Trending esta semana</h2>
            </div>
            <TrendingRow movies={trending.results.slice(0, 12)} />
          </section>
        )}

        {/* Personal Ranking */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title"><IconStar /> Mi Top Películas</h2>
          </div>

          {rankedMovies.length > 0 ? (
            <RankingList movies={rankedMovies} />
          ) : (
            <div className="empty-state">
              <div className="icon"><IconFilm /></div>
              <h3>Tu ranking está vacío</h3>
              <p>
                Busca películas que hayas visto, márcalas como vistas y
                dales tu calificación personal.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
