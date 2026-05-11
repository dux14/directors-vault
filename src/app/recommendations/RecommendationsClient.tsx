/* ============================================
 * Recommendations Client Component
 * ============================================ */

"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/context";
import MovieCard from "@/components/MovieCard";
import type { TMDBMovie } from "@/lib/tmdb";
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

interface Props {
  recommendations: TMDBMovie[];
  hasRatedMovies: boolean;
}

export default function RecommendationsClient({
  recommendations,
  hasRatedMovies,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><IconSparkles /> {t("home.forYou")}</h1>
          <p>
            {hasRatedMovies
              ? t("home.forYou") + " — " + (recommendations.length > 0
                  ? `${recommendations.length} películas recomendadas`
                  : "Califica más películas para mejorar las recomendaciones")
              : "Califica películas para obtener recomendaciones personalizadas"}
          </p>
        </div>

        {recommendations.length > 0 ? (
          <motion.div
            className="movie-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {recommendations.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <MovieCard
                  tmdbId={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  releaseDate={movie.release_date}
                  rating={movie.vote_average}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="empty-state">
            <div className="icon"><IconStar /></div>
            <h3>{hasRatedMovies ? "Sin recomendaciones aún" : "Califica tus películas"}</h3>
            <p>
              {hasRatedMovies
                ? "Intenta calificar más películas con nota B o mejor para que podamos recomendarte."
                : "Busca películas que hayas visto, márcalas como vistas y califícalas. Usaremos tus favoritas para recomendarte nuevas películas."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
