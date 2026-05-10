/* ============================================
 * Home Page — Personal Movie Ranking
 * Shows watched movies sorted by personal rating
 * ============================================ */

import { getRankedMovies } from "@/lib/actions";
import { getTrending } from "@/lib/tmdb";
import RankingList from "./RankingList";
import TrendingRow from "./TrendingRow";
import styles from "./page.module.css";

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
              <h2 className="section-title">🔥 Trending esta semana</h2>
            </div>
            <TrendingRow movies={trending.results.slice(0, 12)} />
          </section>
        )}

        {/* Personal Ranking */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">⭐ Mi Top Películas</h2>
          </div>

          {rankedMovies.length > 0 ? (
            <RankingList movies={rankedMovies} />
          ) : (
            <div className="empty-state">
              <div className="icon">🎬</div>
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
